package com.ews.ner.domain.risk;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name="risk_score")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RiskScore {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID regionId;
    private BigDecimal computedScore;
    
    @Enumerated(EnumType.STRING)
    private Severity severityLevel;
    
    @Column(columnDefinition="jsonb")
    private String contributingFactors;
    
    private BigDecimal mlScore;
    
    @Enumerated(EnumType.STRING)
    private ScoreSource scoreSource;
    
    private OffsetDateTime computedAt;

    public enum Severity { LOW, MODERATE, HIGH, CRITICAL }
    public enum ScoreSource { RULE_BASED, ML_ENHANCED, BLENDED }
}
