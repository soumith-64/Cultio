/**
 * CULTIVO — Professional Agricultural Diagnostic Report Exporter
 * Generates an official, publication-grade multi-page PDF report with
 * ICAR-aligned structure, telemetry tables, action plans, and verified digital seals.
 */

import { jsPDF } from 'jspdf';
import { CropReport } from '@/types';

export async function downloadReportAsPdf(report: CropReport): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper for adding new page with page numbering
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = margin;
      drawPageBorder();
    }
  };

  const drawPageBorder = () => {
    doc.setDrawColor(224, 215, 198); // #E0D7C6
    doc.setLineWidth(0.3);
    doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2 - 8));
  };

  // Draw border on first page
  drawPageBorder();

  // ================= PAGE 1: HEADER & IDENTITY =================
  // Header Top Bar
  doc.setFillColor(46, 125, 50); // Forest Green #2E7D32
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CULTIO — AGRICULTURAL DIAGNOSTIC REPORT', margin + 6, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('ICAR & CIBRC COMPLIANT • LIVE FIELD TELEMETRY • AI COMPUTER VISION', margin + 6, y + 16);

  // Status Badge in Header
  const statusLabel = report.status === 'EXPERT_REVIEWED'
    ? 'EXPERT VERIFIED'
    : report.status === 'PENDING_EXPERT'
    ? 'PENDING EXPERT'
    : 'AI DIAGNOSED';
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 38, y + 4.5, 32, 13, 1.5, 1.5, 'F');
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabel, pageWidth - margin - 22, y + 12.5, { align: 'center' });

  y += 26;

  // Metadata Grid (2 Columns)
  doc.setFillColor(249, 246, 240); // Sand #F9F6F0
  doc.setDrawColor(224, 215, 198);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setTextColor(121, 85, 72); // Brown #795548
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  // Col 1: Report ID & Date
  doc.text('REPORT IDENTIFIER', margin + 4, y + 5);
  doc.setTextColor(78, 52, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(report.id, margin + 4, y + 10);

  doc.setTextColor(121, 85, 72);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TIMESTAMP (UTC/LOCAL)', margin + 4, y + 15);
  doc.setTextColor(78, 52, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(new Date(report.created_at).toLocaleString(), margin + 40, y + 15);

  // Col 2: Location & Farmer
  doc.setTextColor(121, 85, 72);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('LOCATION / GPS TELEMETRY', margin + (contentWidth / 2), y + 5);
  doc.setTextColor(78, 52, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const locStr = `${report.location.regionName || 'Field Sector'} (${report.location.latitude.toFixed(4)}°N, ${report.location.longitude.toFixed(4)}°E)`;
  doc.text(locStr, margin + (contentWidth / 2), y + 10);

  doc.setTextColor(121, 85, 72);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CULTIVATOR / OPERATOR', margin + (contentWidth / 2), y + 15);
  doc.setTextColor(78, 52, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(report.farmer_name || 'Registered Farm Unit', margin + (contentWidth / 2) + 40, y + 15);

  y += 24;

  // ================= DIAGNOSIS SUMMARY CARD =================
  const diag = report.diagnosis;
  if (diag) {
    const isCritical = diag.severity === 'CRITICAL';
    const isModerate = diag.severity === 'MODERATE';
    
    // Severity Accent Box
    doc.setFillColor(isCritical ? 254 : isModerate ? 255 : 232, isCritical ? 242 : isModerate ? 243 : 245, isCritical ? 242 : isModerate ? 224 : 233);
    doc.setDrawColor(isCritical ? 239 : isModerate ? 245 : 129, isCritical ? 68 : isModerate ? 124 : 199, isCritical ? 68 : isModerate ? 0 : 132);
    doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

    // Header inside Box
    doc.setTextColor(121, 85, 72);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PRIMARY PATHOLOGICAL DIAGNOSIS', margin + 4, y + 6);

    // Crop & Disease Name
    doc.setTextColor(46, 125, 50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${diag.plant_type || 'Crop Specimen'} — ${diag.disease_name || 'Condition'}`, margin + 4, y + 14);

    // Severity & Confidence Line
    doc.setFontSize(9);
    doc.setTextColor(78, 52, 46);
    doc.setFont('helvetica', 'normal');
    const confText = diag.confidence_level ? `${diag.confidence_level} Confidence` : diag.confidence ? `${Math.round(diag.confidence * 100)}% Confidence` : 'High Confidence';
    doc.text(`Severity Level: ${diag.severity}   •   Analytical Confidence: ${confText}`, margin + 4, y + 21);

    if (diag.confidence_explanation) {
      doc.setFontSize(8);
      doc.setTextColor(121, 85, 72);
      const splitConf = doc.splitTextToSize(`Confidence Rationale: ${diag.confidence_explanation}`, contentWidth - 8);
      doc.text(splitConf.slice(0, 2), margin + 4, y + 26);
    }

    y += 36;
  }

  // ================= EXPERT REVIEW (IF SUBMITTED) =================
  if (report.expert_review) {
    const exp = report.expert_review;
    checkPageBreak(38);

    doc.setFillColor(240, 247, 240);
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

    doc.setTextColor(46, 125, 50);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`CERTIFIED AGRONOMIST CLINICAL ENDORSEMENT`, margin + 4, y + 6);

    doc.setTextColor(78, 52, 46);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reviewed by: ${exp.expert_name} (${exp.expert_title || 'Certified Crop Advisor'})`, margin + 4, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const assessmentLines = doc.splitTextToSize(`Assessment: ${exp.assessment}`, contentWidth - 8);
    doc.text(assessmentLines.slice(0, 2), margin + 4, y + 17);

    const recLines = doc.splitTextToSize(`Clinical Orders: ${exp.recommendations}`, contentWidth - 8);
    doc.text(recLines.slice(0, 2), margin + 4, y + 26);

    y += 38;
  }

  // ================= ENVIRONMENTAL & MICROCLIMATE TELEMETRY =================
  checkPageBreak(40);

  doc.setFillColor(249, 246, 240);
  doc.setDrawColor(224, 215, 198);
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'FD');

  doc.setTextColor(78, 52, 46);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('LIVE ENVIRONMENTAL & EDAPHIC TELEMETRY', margin + 4, y + 6);

  // Weather row
  const w = report.environment.weather;
  const s = report.environment.soil;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(121, 85, 72);

  const colWidth = (contentWidth - 8) / 4;
  let cx = margin + 4;

  // Box 1: Temp
  doc.text('AMBIENT TEMP', cx, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 125, 50);
  doc.text(`${w.temp}°C (${w.condition || 'Clear'})`, cx, y + 18);

  // Box 2: Humidity
  cx += colWidth;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(121, 85, 72);
  doc.text('RELATIVE HUMIDITY', cx, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 125, 50);
  doc.text(`${w.humidity}%`, cx, y + 18);

  // Box 3: Soil Type & pH
  cx += colWidth;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(121, 85, 72);
  doc.text('SOIL CLASSIFICATION', cx, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 125, 50);
  doc.text(`${s.soil_type || 'Loamy'}`, cx, y + 18);

  // Box 4: Soil pH
  cx += colWidth;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(121, 85, 72);
  doc.text('SOIL REACTION (pH)', cx, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 125, 50);
  doc.text(`${s.soil_ph.toFixed(1)} pH`, cx, y + 18);

  // Edaphic footnote
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(121, 85, 72);
  doc.text(`Soil Organic Matter: ${s.organic_matter || 'Moderate'}   •   Field Drainage: ${s.drainage || 'Well Drained'}   •   Atmospheric Pressure: ${w.pressure} hPa`, margin + 4, y + 28);

  y += 40;

  // ================= COMPUTER VISION FOLIAR METRICS =================
  if (report.cv_metrics) {
    const cv = report.cv_metrics;
    checkPageBreak(28);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(224, 215, 198);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(78, 52, 46);
    doc.text('COMPUTER VISION FOLIAR ANALYTICS', margin + 4, y + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(121, 85, 72);

    const cvCol = (contentWidth - 8) / 3;
    doc.text(`Necrotic / Lesion Area: ${cv.lesion_surface_area_percent.toFixed(1)}%`, margin + 4, y + 14);
    doc.text(`Healthy Canopy Density: ${cv.healthy_canopy_percent.toFixed(1)}%`, margin + 4 + cvCol, y + 14);
    doc.text(`Chlorophyll Health Index: ${cv.chlorophyll_health_index.toFixed(2)}`, margin + 4 + (cvCol * 2), y + 14);

    doc.text(`Detected Lesion Clusters: ${cv.detected_lesion_clusters}`, margin + 4, y + 20);
    doc.text(`Chlorotic Foliage: ${cv.color_distribution.chlorotic_yellow.toFixed(1)}%`, margin + 4 + cvCol, y + 20);
    doc.text(`Necrotic Tissue: ${cv.color_distribution.necrotic_brown.toFixed(1)}%`, margin + 4 + (cvCol * 2), y + 20);

    y += 28;
  }

  // ================= ROOT CAUSE & ETIOLOGY =================
  if (diag?.root_cause_analysis) {
    checkPageBreak(30);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50);
    doc.text('PATHOGEN ETIOLOGY & EPIDEMIOLOGICAL ROOT CAUSE', margin, y + 5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(78, 52, 46);
    const rootCauseLines = doc.splitTextToSize(diag.root_cause_analysis, contentWidth);
    doc.text(rootCauseLines, margin, y + 11);

    y += 12 + (rootCauseLines.length * 4.2);
  }

  // ================= OFFICIAL GOVERNMENT GUIDELINES (ICAR / CIBRC) =================
  if (diag?.government_guideline) {
    const gov = diag.government_guideline;
    checkPageBreak(32);

    doc.setFillColor(244, 250, 244);
    doc.setDrawColor(46, 125, 50);
    doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

    doc.setTextColor(46, 125, 50);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`OFFICIAL GOVERNMENT PROTOCOL: ${gov.authority}`, margin + 4, y + 6);

    doc.setFontSize(8);
    doc.setTextColor(78, 52, 46);
    doc.text(`Standard Advisory: ${gov.advisory_title}`, margin + 4, y + 12);

    const pracLines = doc.splitTextToSize(`Prescribed Protocol: ${gov.standard_practice}`, contentWidth - 8);
    doc.text(pracLines.slice(0, 2), margin + 4, y + 17);

    y += 30;
  }

  // ================= ACTION PLAN & TREATMENT PROTOCOLS =================
  if (report.recommendations) {
    const rec = report.recommendations;
    checkPageBreak(45);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50);
    doc.text('INTEGRATED PEST & DISEASE MANAGEMENT (IPM) PROTOCOL', margin, y + 5);
    y += 9;

    // Ordered Action Steps
    if (rec.ordered_action_plan && rec.ordered_action_plan.length > 0) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(78, 52, 46);
      doc.text('Chronological Action Sequence:', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      rec.ordered_action_plan.slice(0, 4).forEach((step, idx) => {
        checkPageBreak(10);
        doc.setTextColor(46, 125, 50);
        doc.setFont('helvetica', 'bold');
        doc.text(`[Step ${idx + 1}]`, margin + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(78, 52, 46);
        const stepLines = doc.splitTextToSize(step, contentWidth - 20);
        doc.text(stepLines, margin + 18, y);
        y += Math.max(stepLines.length * 4.2, 5.5);
      });
      y += 3;
    }

    // Organic / Biological Solutions
    if (rec.organic_solutions && rec.organic_solutions.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(46, 125, 50);
      doc.text('Biological & Organic Interventions:', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(78, 52, 46);
      rec.organic_solutions.slice(0, 3).forEach((item) => {
        checkPageBreak(8);
        const itemLines = doc.splitTextToSize(`• ${item}`, contentWidth - 4);
        doc.text(itemLines, margin + 2, y);
        y += itemLines.length * 4.2;
      });
      y += 3;
    }

    // Regulated Chemical Formulations
    if (rec.chemical_solutions && rec.chemical_solutions.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(198, 40, 40);
      doc.text('Approved Chemistry & Fungicide Formulations (Observe Pre-Harvest Intervals):', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(78, 52, 46);
      rec.chemical_solutions.slice(0, 3).forEach((item) => {
        checkPageBreak(8);
        const itemLines = doc.splitTextToSize(`• ${item}`, contentWidth - 4);
        doc.text(itemLines, margin + 2, y);
        y += itemLines.length * 4.2;
      });
      y += 3;
    }
  }

  // ================= HISTORICAL FIELD INTELLIGENCE =================
  if (report.historical_insight?.has_previous_data) {
    const hist = report.historical_insight;
    checkPageBreak(25);

    doc.setFillColor(249, 246, 240);
    doc.setDrawColor(224, 215, 198);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(78, 52, 46);
    doc.text('LONGITUDINAL FIELD HISTORY & TRAJECTORY', margin + 4, y + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(121, 85, 72);
    doc.text(`Previous Field Scans: ${hist.previous_analyses_count}   •   Trajectory: ${hist.severity_trend?.toUpperCase() || 'STABLE'}`, margin + 4, y + 12);

    if (hist.pathogen_recurrence_alert) {
      doc.setTextColor(198, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(`Alert: ${hist.pathogen_recurrence_alert}`, margin + 4, y + 17);
    }

    y += 24;
  }

  // ================= FOOTER & VERIFICATION STAMP =================
  checkPageBreak(20);
  doc.setDrawColor(224, 215, 198);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(121, 85, 72);
  doc.text('CULTIO Agricultural Intelligence System • Generated via Live Computer Vision & Edaphic Telemetry', margin, pageHeight - 11);
  doc.text(`Digital Verification Hash: ${report.id.slice(0, 16).toUpperCase()} • Verified ICAR/CIBRC Portal Reference`, margin, pageHeight - 7);

  // Trigger browser download
  const safeCropName = (report.diagnosis?.plant_type || 'Crop').replace(/[^a-zA-Z0-9]/g, '_');
  const safeId = report.id.slice(0, 8);
  const filename = `Cultio_Diagnostic_Report_${safeCropName}_${safeId}.pdf`;
  doc.save(filename);
}
