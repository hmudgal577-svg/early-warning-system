package com.ews.ner.service;

import com.ews.ner.api.dto.CreateReportRequest;
import com.ews.ner.domain.region.Region;
import com.ews.ner.domain.region.RegionRepository;
import com.ews.ner.domain.report.CitizenReport;
import com.ews.ner.domain.report.CitizenReport.ReportStatus;
import com.ews.ner.domain.report.CitizenReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    private final CitizenReportRepository reportRepo;
    private final RegionRepository regionRepo;
    private final RiskService riskService;
    private final LiveFeedService liveFeed;

    @Transactional
    public CitizenReport createReport(CreateReportRequest req, UUID reporterId, String photoUrl) {
        Region region = regionRepo.findRegionByPoint(req.getLng().doubleValue(), req.getLat().doubleValue());
        
        CitizenReport report = CitizenReport.builder()
                .geoLat(req.getLat())
                .geoLng(req.getLng())
                .regionId(region != null ? region.getId() : null)
                .category(req.getCategory())
                .description(req.getDescription())
                .reporterType(req.getReporterType())
                .reporterId(reporterId)
                .photoUrl(photoUrl)
                .createdAt(OffsetDateTime.now())
                .build();
                
        report = reportRepo.save(report);
        liveFeed.broadcastReport(report);

        if (region != null && report.getStatus() == ReportStatus.PENDING) {
            riskService.computeAndSave(region.getId());
        }
        
        return report;
    }

    @Transactional
    public CitizenReport updateStatus(UUID reportId, ReportStatus status) {
        CitizenReport report = reportRepo.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        report.setStatus(status);
        reportRepo.save(report);
        
        if (report.getRegionId() != null) {
            riskService.computeAndSave(report.getRegionId());
        }
        return report;
    }
    
    public List<CitizenReport> getReportsForRegion(UUID regionId) {
        return reportRepo.findByRegionIdAndStatusIn(regionId, List.of(ReportStatus.PENDING, ReportStatus.VERIFIED));
    }
    
    public List<CitizenReport> getRecentReports() {
        return reportRepo.findTop20ByOrderByCreatedAtDesc();
    }
}
