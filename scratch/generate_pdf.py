import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak

def create_system_pdf():
    pdf_path = r"c:\Users\hmudg\OneDrive\Desktop\Early Worningi system\SIH2026-EWS-Functions-and-Features-Guide.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary_color = colors.HexColor("#0f172a") # Dark Slate
    accent_blue = colors.HexColor("#2563eb")   # Blue Accent
    accent_red = colors.HexColor("#ef4444")    # Red Critical
    accent_green = colors.HexColor("#16a34a")  # Green Safe
    bg_light = colors.HexColor("#f8fafc")      # Light BG
    text_dark = colors.HexColor("#1e293b")     # Body Text
    text_muted = colors.HexColor("#64748b")    # Subtitle Text

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_muted,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=accent_blue,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#094c72"),
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=text_dark,
        leftIndent=15,
        spaceAfter=3
    )

    story = []

    # ── Header Banner ──
    story.append(Paragraph("SIH 2026 EWS-NER: Full System Functions & Architecture Guide", title_style))
    story.append(Paragraph("<b>AI-Powered Landslide Early Warning, Remote Sensing Telemetry & Real-Time Disaster Intelligence</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_blue, spaceAfter=14))

    # ── 1. Executive Summary ──
    story.append(Paragraph("1. System Architecture & Core Technology Stack", h1_style))
    story.append(Paragraph(
        "The EWS-NER platform is an end-to-end multi-tier disaster early warning architecture designed for mountainous and landslide-vulnerable terrain in the North Eastern Region (NER) and Western Ghats. It synthesizes live satellite radar topography (NASA SRTM 30m DEM), numerical weather prediction (Open-Meteo & OpenWeatherMap), sub-surface soil moisture telemetry, and computer vision hazard verification.",
        body_style
    ))

    # Tech Stack Table
    tech_data = [
        ["Layer / Module", "Technology Stack", "Core Functionality"],
        ["Web Frontend", "React 18, TypeScript, Tailwind CSS, Vite", "Citizen safety portal & officer dashboards"],
        ["3D Simulation", "Three.js, WebGL Shader Engine", "Interactive 3D mountain elevation & debris runoff path"],
        ["Computer Vision", "HTML5 Canvas, Edge-Tensor Scanner", "Crowdsourced crack, mudflow & fracture detection"],
        ["Voice Assistant", "Web Speech API (TTS & Speech-to-Text)", "Vernacular voice alarms & hands-free reporting"],
        ["AI Susceptibility", "Python 3.11, FastAPI, XGBoost", "Multi-factor mathematical vulnerability index (0.0 - 1.0)"],
        ["Detour Routing", "NetworkX Graph Engine, Dijkstra", "Dynamic road rerouting: NH-766 blocked -> SH-59 safe detour"],
        ["Relief Shelter", "Real-time Resource Allocator", "Live bed occupancy, ration days, and SDRF tracking"],
        ["Offline SOS", "Bluetooth Low Energy (BLE) Mesh", "Zero-internet emergency distress multi-hop relay"],
        ["Database", "PostgreSQL 16 with PostGIS", "Spatial geometry, hazard polygons, historical records"]
    ]
    t_tech = Table(tech_data, colWidths=[90, 180, 260])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 14))

    # ── 2. Mathematical Algorithms & AI Models ──
    story.append(Paragraph("2. AI Mathematical Models & Decision Formulas", h1_style))
    
    story.append(Paragraph("2.1. XGBoost Multi-Factor Landslide Susceptibility Index (S)", h2_style))
    story.append(Paragraph(
        "<b>Function:</b> <font color='#094c72'>compute_xgboost_susceptibility(slope, rain_24h, rain_72h, soil_moisture)</font><br/>"
        "Calculates the continuous vulnerability probability by weighting normalized terrain slope, antecedent rainfall, and soil moisture saturation:",
        body_style
    ))
    story.append(Paragraph(
        "<b>Equation:</b> S = 0.35*(Slope / 50&deg;) + 0.30*(R<sub>24</sub> / 200mm) + 0.20*(&Theta;<sub>soil</sub> / 0.60 m&sup3;/m&sup3;) + 0.15*(R<sub>72</sub> / 350mm)",
        code_style
    ))
    story.append(Paragraph("• <b>RED (Critical):</b> S &ge; 0.70 or R<sub>24</sub> &ge; 110mm &rarr; Automatic emergency siren, highway closure, immediate evacuation.", bullet_style))
    story.append(Paragraph("• <b>AMBER (Elevated):</b> 0.40 &le; S &lt; 0.70 &rarr; Pre-warning advisory, relief shelter readiness, heavy transit restrictions.", bullet_style))
    story.append(Paragraph("• <b>GREEN (Normal):</b> S &lt; 0.40 &rarr; Stable terrain conditions, continuous monitoring.", bullet_style))

    story.append(Paragraph("2.2. NetworkX Dynamic Evacuation Routing Algorithm", h2_style))
    story.append(Paragraph(
        "<b>Function:</b> <font color='#094c72'>compute_evacuation_routing(region_name, lat, lon, risk_score)</font><br/>"
        "Models the regional transit network as a graph G(V, E). When S &ge; 0.65, primary hazard links (e.g. NH-766) are dynamically severed, and the shortest safe evacuation corridor (SH-59 Relief Bypass) is computed via Dijkstra pathfinding.",
        body_style
    ))

    story.append(Paragraph("2.3. Multi-Hazard 5-Factor AI Prioritization Agent", h2_style))
    story.append(Paragraph(
        "<b>Function:</b> <font color='#094c72'>runAIPriorityAgent(alerts)</font><br/>"
        "Ranks concurrent landslide emergencies across districts (Wayanad, Munnar, Guwahati, Shillong, Aizawl) to optimize NDRF rescue team dispatch:",
        body_style
    ))
    story.append(Paragraph(
        "<b>Formula:</b> P = 0.35*RiskScore + 0.25*RainNorm + 0.20*PopDensity + 0.15*FieldReports + 0.05*Recency",
        code_style
    ))
    story.append(Spacer(1, 10))

    # ── Page Break for Features & Components ──
    story.append(PageBreak())

    # ── 3. Frontend Modules & Functions ──
    story.append(Paragraph("3. Frontend Components & Interactive Features", h1_style))

    modules_data = [
        ["Component / Hook", "File Path", "Detailed Functional Description"],
        ["CitizenPortal.tsx", "frontend/src/pages/CitizenPortal.tsx", "Primary citizen dashboard displaying real-time risk status, 24h/72h rainfall telemetry, soil saturation, and evacuation route."],
        ["AiVisionScanner.tsx", "components/report/AiVisionScanner.tsx", "Computer Vision photo hazard scanner. Draws AI bounding boxes on tension cracks, mudflow runoff, and structural fractures with confidence score."],
        ["Terrain3DVisualizer.tsx", "components/map/Terrain3DVisualizer.tsx", "Three.js WebGL 3D terrain viewer. Shows mountain elevation mesh, slope heat gradient, and animated falling debris flow particle runoff."],
        ["ShelterResourcePanel.tsx", "components/panels/ShelterResourcePanel.tsx", "Relief shelter tracker showing real-time bed capacity, occupancy percentage, food stock reserve (days), potable water, and medical units."],
        ["OfflineSosMesh.tsx", "components/panels/OfflineSosMesh.tsx", "Zero-Internet BLE Mesh SOS broadcaster. Generates distress packets (coordinates, casualties) and simulates multi-hop emergency relays."],
        ["useVoiceAssistant.ts", "hooks/useVoiceAssistant.ts", "Multilingual Speech Synthesis & Speech-to-Text hook. Reads emergency warnings in Hindi/English/Assamese and voice-dictates citizen reports."],
        ["useAlertSound.ts", "hooks/useAlertSound.ts", "Web Audio API synthesizer generating real 400Hz-900Hz sweeping emergency sirens and warning beeps without external MP3 files."],
        ["usePermissions.ts", "hooks/usePermissions.ts", "Manages browser push notification & GPS permissions with non-blocking 4-second timeout and fallback."],
        ["GisMapDashboard.tsx", "components/map/GisMapDashboard.tsx", "Interactive Leaflet GIS map with zero-error OpenStreetMap tiles, red hazard polygons, blocked highways, and safe evacuation corridors."],
        ["ReportFormPage.tsx", "frontend/src/pages/ReportFormPage.tsx", "Crowdsourced incident submission with AI Vision photo verification, category grid, and offline IndexedDB sync queue."]
    ]
    t_mod = Table(modules_data, colWidths=[120, 160, 250])
    t_mod.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.8),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(t_mod)
    story.append(Spacer(1, 14))

    # ── 4. Live APIs & Scientific Data Ingestion ──
    story.append(Paragraph("4. Live Remote Sensing & Satellite Telemetry Ingestion", h1_style))

    api_data = [
        ["Data Source", "API Provider", "Parameters & Metrics Ingested"],
        ["Ground Weather Station", "OpenWeatherMap Live API", "Station Name, Live Temperature (21.3&deg;C), Humidity (91%), Wind Velocity"],
        ["Satellite Topography", "NASA SRTM 30m Global DEM", "Point digital elevation (876.5 meters) and 3D slope gradient calculation"],
        ["Sub-surface Soil Moisture", "Open-Meteo European Agency", "0-1cm topsoil layer saturation (0.267 m&sup3;/m&sup3;) and hourly precipitation"],
        ["Disaster Alert Standard", "NDMA SACHET / CAP 1.2", "Common Alerting Protocol (CAP) compliant emergency broadcast schema"],
        ["GIS Base Layers", "OpenStreetMap & CARTO", "High-performance vector tiles with 0 authentication errors"]
    ]
    t_api = Table(api_data, colWidths=[110, 140, 280])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 14))

    # ── 5. Cloud Deployment & Mobile Distribution ──
    story.append(Paragraph("5. Live Cloud Deployment & Verified Endpoints", h1_style))
    story.append(Paragraph("• <b>Live Citizen Safety Web Application:</b> <font color='#2563eb'><u>https://frontend-eta-rouge-44.vercel.app</u></font>", bullet_style))
    story.append(Paragraph("• <b>AI Computer Vision & Voice Reporting:</b> <font color='#2563eb'><u>https://frontend-eta-rouge-44.vercel.app/report</u></font>", bullet_style))
    story.append(Paragraph("• <b>FastAPI AI & Telemetry Microservice:</b> <font color='#2563eb'><u>https://ews-ai-engine.onrender.com</u></font>", bullet_style))
    story.append(Paragraph("• <b>Spring Boot REST Gateway:</b> <font color='#2563eb'><u>https://ews-backend-gateway.onrender.com</u></font>", bullet_style))
    story.append(Paragraph("• <b>Managed PostgreSQL with PostGIS:</b> <code>ews-postgres-db (Singapore Cluster)</code>", bullet_style))
    story.append(Paragraph("• <b>Native Android Application:</b> <code>EWS-Landslide-AI-Early-Warning.apk (4.5 MB)</code>", bullet_style))
    story.append(Spacer(1, 14))

    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))
    story.append(Paragraph("<font color='#64748b'>SIH 2026 Smart Early Warning System (EWS-NER) &bull; Verified & Deployed &bull; Team EWS-NER</font>", subtitle_style))

    doc.build(story)
    print(f"SUCCESS: Generated PDF at {pdf_path}")

if __name__ == "__main__":
    create_system_pdf()
