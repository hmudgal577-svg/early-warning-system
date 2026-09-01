package com.ews.ner.api;

import com.ews.ner.api.dto.CreateReportRequest;
import com.ews.ner.domain.report.CitizenReport;
import com.ews.ner.domain.report.CitizenReport.ReportStatus;
import com.ews.ner.infra.storage.FileStorageService;
import com.ews.ner.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;
    private final FileStorageService fileStorage;

    @PostMapping
    public ResponseEntity<CitizenReport> createReport(@Valid @RequestBody CreateReportRequest req) {
        return ResponseEntity.ok(reportService.createReport(req, null, null));
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadPhoto(@RequestParam("file") MultipartFile file) {
        String url = fileStorage.store(file, "reports");
        return ResponseEntity.ok(url);
    }

    @GetMapping("/region/{regionId}")
    public ResponseEntity<List<CitizenReport>> getReportsForRegion(@PathVariable UUID regionId) {
        return ResponseEntity.ok(reportService.getReportsForRegion(regionId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<CitizenReport>> getRecentReports() {
        return ResponseEntity.ok(reportService.getRecentReports());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CitizenReport> updateStatus(@PathVariable UUID id, @RequestParam ReportStatus status) {
        return ResponseEntity.ok(reportService.updateStatus(id, status));
    }
}
