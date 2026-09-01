package com.ews.ner.service;

import com.ews.ner.api.dto.RegionRiskDTO;
import com.ews.ner.domain.region.Region;
import com.ews.ner.domain.region.RegionRepository;
import com.ews.ner.domain.risk.RiskScore;
import com.ews.ner.domain.risk.RiskScoreRepository;
import com.ews.ner.engine.RiskScoringEngine;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskService {
    private final RiskScoringEngine engine;
    private final RiskScoreRepository riskRepo;
    private final RegionRepository regionRepo;
    private final AlertService alertService;
    private final ObjectMapper objectMapper;

    @Transactional
    public RiskScore computeAndSave(UUID regionId) {
        Region region = regionRepo.findById(regionId).orElseThrow(() -> new IllegalArgumentException("Region not found"));
        RiskScore score = engine.computeForRegion(regionId);
        riskRepo.save(score);
        alertService.checkAndAlert(region, score);
        return score;
    }

    public Optional<RiskScore> getLatestForRegion(UUID regionId) {
        return riskRepo.findTopByRegionIdOrderByComputedAtDesc(regionId);
    }

    public List<RegionRiskDTO> getHeatmap() {
        List<RiskScore> latestScores = riskRepo.findLatestForAllRegions();
        List<Region> regions = regionRepo.findAll();
        
        return latestScores.stream().map(score -> {
            Region r = regions.stream().filter(reg -> reg.getId().equals(score.getRegionId())).findFirst().orElse(null);
            if (r == null) return null;
            
            RegionRiskDTO dto = new RegionRiskDTO();
            dto.setRegionId(r.getId());
            dto.setName(r.getName());
            dto.setDistrict(r.getDistrict());
            dto.setState(r.getState());
            if (r.getCentroid() != null) {
                dto.setCentroidLat(r.getCentroid().getY());
                dto.setCentroidLng(r.getCentroid().getX());
            }
            dto.setSeverity(score.getSeverityLevel());
            dto.setComputedScore(score.getComputedScore());
            dto.setComputedAt(score.getComputedAt());
            dto.setRoadStatus(r.getRoadStatus());
            try {
                dto.setContributingFactors(objectMapper.readValue(score.getContributingFactors(), new TypeReference<Map<String, Object>>() {}));
            } catch (Exception e) {
                dto.setContributingFactors(Map.of());
            }
            return dto;
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }

    @Scheduled(cron = "0 */30 * * * *")
    @Transactional
    public void recomputeAll() {
        log.info("Starting batch recomputation of risk scores for all regions");
        List<Region> regions = regionRepo.findAll();
        regions.forEach(r -> {
            try {
                computeAndSave(r.getId());
            } catch (Exception e) {
                log.error("Failed to recompute risk for region {}", r.getId(), e);
            }
        });
    }
}
