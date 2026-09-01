package com.ews.ner.api.dto;

import com.ews.ner.domain.report.CitizenReport.ReportCategory;
import com.ews.ner.domain.report.CitizenReport.ReporterType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateReportRequest {
    @NotNull
    private BigDecimal geoLat;
    @NotNull
    private BigDecimal geoLng;
    
    private ReportCategory category;
    private String description;
    private ReporterType reporterType;
}
