from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io

def create_incident_report_pdf(report_data):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30
    )
    story.append(Paragraph("Incident Reporting Form", title_style))
    story.append(Spacer(1, 12))

    # Contact Information
    story.append(Paragraph("Contact Information of the Reporter", styles["Heading2"]))
    contact_data = [
        ["Name & Role/Title:", report_data.get("name", "")],
        ["Organization:", report_data.get("organization", "")],
        ["Contact No.:", report_data.get("contact", "")],
        ["Email:", report_data.get("email", "")],
        ["Address:", report_data.get("address", "")]
    ]
    
    contact_table = Table(contact_data, colWidths=[2*inch, 4*inch])
    contact_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(contact_table)
    story.append(Spacer(1, 20))

    # Incident Details
    story.append(Paragraph("Basic Incident Details", styles["Heading2"]))
    incident_data = [
        ["Affected Entity:", report_data.get("affected_entity", "")],
        ["Incident Type:", report_data.get("incident_type", "")],
        ["System Critical:", report_data.get("is_critical", "")],
        ["Domain/URL:", report_data.get("domain", "")],
        ["IP Address:", report_data.get("ip_address", "")],
        ["Operating System:", report_data.get("os", "")],
        ["Location:", report_data.get("location", "")],
        ["Description:", report_data.get("description", "")],
        ["Occurrence Date:", report_data.get("occurrence_date", "")],
        ["Detection Date:", report_data.get("detection_date", "")]
    ]
    
    incident_table = Table(incident_data, colWidths=[2*inch, 4*inch])
    incident_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(incident_table)

    doc.build(story)
    buffer.seek(0)
    return buffer 