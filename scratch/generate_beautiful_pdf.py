import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, KeepTogether
)

def build_simple_guide_pdf():
    pdf_path = r"c:\Users\hmudg\OneDrive\Desktop\Early Worningi system\EWS-Project-Complete-Guide-Hindi-English.pdf"
    
    # 0.75 inch margins
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()

    # Premium Color Palette
    primary = colors.HexColor("#0f172a")      # Dark Navy
    accent_blue = colors.HexColor("#2563eb")  # Royal Blue
    accent_red = colors.HexColor("#dc2626")   # Warning Red
    accent_green = colors.HexColor("#16a34a") # Safe Green
    accent_amber = colors.HexColor("#d97706") # Amber Notice
    card_bg = colors.HexColor("#f8fafc")      # Soft Light Grey
    card_border = colors.HexColor("#e2e8f0")  # Light Border
    text_dark = colors.HexColor("#1e293b")
    text_muted = colors.HexColor("#475569")

    # Typography Styles
    title_style = ParagraphStyle(
        'MainTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary,
        alignment=1, # Center
        spaceAfter=4
    )

    tagline_style = ParagraphStyle(
        'Tagline',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_blue,
        alignment=1, # Center
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_dark,
        spaceAfter=6
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=14,
        textColor=primary,
        spaceAfter=4
    )

    box_text = ParagraphStyle(
        'BoxText',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark
    )

    box_title = ParagraphStyle(
        'BoxTitle',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=primary,
        spaceAfter=3
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=text_dark,
        leftIndent=12,
        spaceAfter=4
    )

    link_style = ParagraphStyle(
        'LinkText',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=accent_blue
    )

    story = []

    # ── HEADER BANNER ──
    story.append(Paragraph("🛡️ AI Landslide Early Warning & Disaster Safety System", title_style))
    story.append(Paragraph("Aam Janta Aur Prashasan Ke Liye Pura Project Guide (Simple & Easy to Understand)", tagline_style))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_blue, spaceAfter=12))

    # ── 1. WHAT IS THIS PROJECT ──
    story.append(Paragraph("1. Yeh Project Kya Hai Aur Iska Maqsad Kya Hai? (Overview)", h1_style))
    story.append(Paragraph(
        "Pahadi ilaqo (jaise <b>Wayanad, Kerala, Shillong, Guwahati, Munnar, Aizawl</b>) me bhari baarish ke dauran achanak <b>bhuskhalan (landslide)</b> aane se hazaron logo ki jaan chali jaati hai aur raste band ho jaate hain. <br/>"
        "Yeh system <b>AI (Artificial Intelligence), NASA Satellite Data aur Live Mausam Vibhag (Weather API)</b> ki madad se bhuskhalan aane se <b>kuch ghante pehle hi logo ko alert kar deta hai</b> aur unhe bachne ka sabse surakshit rasta batata hai.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Key Highlights Cards (Table)
    def make_feature_box(icon, title, desc, border_color):
        content = [
            Paragraph(f"<b>{icon} {title}</b>", box_title),
            Paragraph(desc, box_text)
        ]
        t = Table([[content]], colWidths=[260])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), card_bg),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    c1 = make_feature_box("🚨", "Real-Time Emergency Siren", "Jaise hi khatra badhta hai (RED Alert), phone me automatic emergency siren bajta hai aur push notification aata hai.", accent_red)
    c2 = make_feature_box("🚗", "Safe Road Detour Routing", "Agar mukhya highway (NH-766) par malba gir gaya hai, toh system turant surakshit bypass (SH-59) ka rasta dikhata hai.", accent_green)
    c3 = make_feature_box("📸", "AI Photo Scanner", "Raste me daraar ya mitti fisalne ki photo upload karo, AI turant scan karke khatre ki gambhirta bata deta hai.", accent_blue)
    c4 = make_feature_box("🗣️", "Multilingual Voice Alerts", "Padhe-likhe na hone par bhi app Hindi, English ya Assamese me bolkar alert sunata hai aur bolkar report likh sakte hain.", accent_amber)

    grid_1 = Table([[c1, c2], [c3, c4]], colWidths=[270, 270])
    grid_1.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(grid_1)
    story.append(Spacer(1, 10))

    # ── 2. CITIZEN PORTAL FEATURES ──
    story.append(Paragraph("2. Citizen Portal: Aam Nagrik Ke Liye Kaun-Kaun Se Features Hain?", h1_style))
    story.append(Paragraph(
        "Citizen Portal aam janta ke liye banaya gaya hai jahan <b>bina kisi login ke</b> sirf ek click me apne ilaqe ki suraksha check ki ja sakti hai:",
        body_style
    ))

    citizen_points = [
        "<b>📍 GPS Auto-Zone Detection:</b> Aap jahan khade hain, app automatic aapki location detect karke sabse paas wale pahad ka live risk level bata deta hai.",
        "<b>🚦 3-Color Live Risk Meter:</b><br/>"
        "&nbsp;&nbsp;&bull; <font color='#16a34a'><b>GREEN (Safe):</b></font> Mausam normal hai, ghabrane ki koi zaroorat nahi hai.<br/>"
        "&nbsp;&nbsp;&bull; <font color='#d97706'><b>AMBER (Pre-Warning):</b></font> Bhari baarish ho rahi hai, alert rahein aur tayyari rakhein.<br/>"
        "&nbsp;&nbsp;&bull; <font color='#dc2626'><b>RED (Evacuate Now):</b></font> Mitti fisalne ka poora khatra hai, turant surakshit jagah par niklein!",
        "<b>🌧️ Live Mausam & Nami (Telemetry):</b> Pichle 24 ghante me kitni baarish hui aur mitti kitni geeli ho chuki hai (Topsoil Moisture), sab live dikhta hai.",
        "<b>🛡️ Bachav Ke Niyam (Survival Guide):</b> Aapatkaal ke waqt kya karna chahiye aur kin helplines (1070 / 1077) par phone karna hai, uski poori jaankari."
    ]
    for pt in citizen_points:
        story.append(Paragraph(pt, bullet_style))

    story.append(Spacer(1, 10))

    # ── Page Break for 3D, Relief, SOS ──
    story.append(PageBreak())

    # ── 3. ADVANCED 5 FEATURES ──
    story.append(Paragraph("3. 5 Naye Advanced Features (Jo Is Project Ko Sabse Alag Banate Hain)", h1_style))
    story.append(Paragraph(
        "Hackathon aur real disaster management ke liye humne isme <b>5 powerful features</b> add kiye hain:",
        body_style
    ))

    # Feature Cards in Full Width
    def make_wide_card(num, title, tagline, bullets, border_color):
        rows = [
            Paragraph(f"<b>{num}. {title}</b> — <font color='{border_color.hexval()}'>{tagline}</font>", box_title)
        ]
        for b in bullets:
            rows.append(Paragraph(f"• {b}", box_text))
        t = Table([[rows]], colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), card_bg),
            ('BOX', (0,0), (-1,-1), 1.2, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 7),
            ('BOTTOMPADDING', (0,0), (-1,-1), 7),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        return t

    f1 = make_wide_card(
        "A", "📸 AI Computer Vision Hazard Scanner", "Photo Se Daraar & Malba Pehchanne Ka AI",
        [
            "Citizen jab sadak par darar ya mitti girne ki photo upload karta hai, AI image ko scan karta hai.",
            "Photo ke upar Red Bounding Box ban kar aa jata hai: <b>'Tension Crack (92.4% Confidence)'</b>.",
            "Report form me saari details (Category aur description) automatic bhar jaati hain."
        ],
        accent_blue
    )
    story.append(f1)
    story.append(Spacer(1, 6))

    f2 = make_wide_card(
        "B", "⛰️ 3D Pahad & Malba Runoff Simulation (Three.js)", "Pahadi Dhalan Ka 3D Model",
        [
            "NASA Satellite Radar ke data se pahad ka 3D model screen par ghumta hai.",
            "Steep slope angle (38.5 degree) ko 3D gradient me dikhata hai.",
            "Screen par malba (debris flow) girne ka animated rasta live dikhta hai taaki log samajh sakein ki malba kidhar aayega."
        ],
        accent_red
    )
    story.append(f2)
    story.append(Spacer(1, 6))

    f3 = make_wide_card(
        "C", "🏥 Relief Camps & Bistar / Khane Ki Live Jaankari", "Surakshit Shelter Resource Tracker",
        [
            "Aas-paas ke sarkari relief camps ki list dikhata hai.",
            "<b>Bed Occupancy:</b> Kitne bistar khali hain aur kitne bhare hain (e.g. 215 / 350 beds occupied).",
            "<b>Rations:</b> Kitne din ka khana bacha hai (e.g. 7 Days Food Reserve), peene ka paani aur Doctor team ka contact."
        ],
        accent_green
    )
    story.append(f3)
    story.append(Spacer(1, 6))

    f4 = make_wide_card(
        "D", "📴 Offline SOS Mesh (Bina Internet Ke Madad)", "Mobile Network Down Hone Par Bhi Kaam Karta Hai",
        [
            "Bhuskhalan ke waqt mobile tower tootne par <b>Bluetooth Low Energy (BLE) Mesh</b> activate hota hai.",
            "Ek mobile se dusre mobile tak bina internet ke SOS signal travel karta hai aur rescue team tak pahunchta hai."
        ],
        accent_amber
    )
    story.append(f4)
    story.append(Spacer(1, 6))

    f5 = make_wide_card(
        "E", "🗣️ Multilingual Voice Assistant (Bolkar Alert Sunna)", "Bhashini AI / Vernacular Voice",
        [
            "Khatra aane par app <b>Hindi, English aur Assamese me bolkar</b> chetavni sunata hai.",
            "Report likhte waqt type karne ki zaroorat nahi — microphone daba kar bolenge toh text automatic likha jayega."
        ],
        accent_blue
    )
    story.append(f5)
    story.append(Spacer(1, 10))

    # ── 4. HOW TO TEST & LIVE LINKS ──
    story.append(Paragraph("4. Live Project Links (Kahan Test Karein?)", h1_style))
    
    links_table_data = [
        [Paragraph("<b>Service / Module</b>", box_title), Paragraph("<b>Link / Path</b>", box_title), Paragraph("<b>Kaam Kya Hai</b>", box_title)],
        [
            Paragraph("<b>🌐 Live Citizen App</b>", box_text),
            Paragraph("<font color='#2563eb'><u>https://frontend-eta-rouge-44.vercel.app/citizen</u></font>", link_style),
            Paragraph("Citizen Safety Portal, 3D simulation, siren, relief camps", box_text)
        ],
        [
            Paragraph("<b>📸 AI Photo Scanner</b>", box_text),
            Paragraph("<font color='#2563eb'><u>https://frontend-eta-rouge-44.vercel.app/report</u></font>", link_style),
            Paragraph("Photo scan karke aapatkaal report submit karna", box_text)
        ],
        [
            Paragraph("<b>🛰️ 3D GIS Command Map</b>", box_text),
            Paragraph("<font color='#2563eb'><u>https://frontend-eta-rouge-44.vercel.app/sih-dashboard</u></font>", link_style),
            Paragraph("Prashasan ke liye full-screen disaster map", box_text)
        ],
        [
            Paragraph("<b>📱 Android Mobile APK</b>", box_text),
            Paragraph("<code>EWS-Landslide-AI-Early-Warning.apk (4.5 MB)</code>", box_text),
            Paragraph("Mobile me install karke offline test karne ke liye", box_text)
        ],
        [
            Paragraph("<b>📦 Complete ZIP File</b>", box_text),
            Paragraph("<code>EWS-Landslide-Full-Codebase.zip (16.8 MB)</code>", box_text),
            Paragraph("Partner / Mentor ko share karne ke liye pura source code", box_text)
        ]
    ]

    t_links = Table(links_table_data, colWidths=[130, 240, 170])
    t_links.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, card_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_links)
    story.append(Spacer(1, 14))

    story.append(HRFlowable(width="100%", thickness=1, color=card_border, spaceAfter=8))
    story.append(Paragraph(
        "<font color='#64748b'><b>SIH 2026 Smart Early Warning System (EWS-NER)</b> &bull; Simple Non-Technical Presentation Guide &bull; Ready to Share</font>",
        ParagraphStyle('Footer', fontName='Helvetica', fontSize=8, alignment=1, textColor=text_muted)
    ))

    doc.build(story)
    print(f"SUCCESS! Beautiful Simple PDF generated at: {pdf_path}")

if __name__ == "__main__":
    build_simple_guide_pdf()
