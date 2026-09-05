package com.ews.ner.api;

import com.ews.ner.api.dto.RegionRiskDTO;
import com.ews.ner.service.RiskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;

/**
 * Server-Sent Events controller for real-time heatmap streaming.
 */
@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
@Slf4j
public class RiskSseController {

    private final RiskService riskService;
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamHeatmap() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                List<RegionRiskDTO> data = riskService.getHeatmap();
                emitter.send(SseEmitter.event().name("heatmap").data(data, org.springframework.http.MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                log.warn("Failed to send initial SSE heatmap: {}", e.getMessage());
                emitters.remove(emitter);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    public void pushHeatmapToAll(List<RegionRiskDTO> data) {
        List<SseEmitter> dead = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("heatmap").data(data, org.springframework.http.MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                dead.add(emitter);
            }
        }
        emitters.removeAll(dead);
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 30000)
    public void sendHeartbeat() {
        List<SseEmitter> dead = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("ping").data("ok"));
            } catch (Exception e) {
                dead.add(emitter);
            }
        }
        emitters.removeAll(dead);
    }
}
