const PDFDocument = require('pdfkit');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const generateReport = async (req, res) => {
  try {
    const { faculty_id } = req.body;

    if (!faculty_id) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID required'
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', faculty_id)
      .eq('role', 'faculty')
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', faculty_id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: publications } = await supabase
      .from('publications')
      .select('*')
      .eq('user_id', faculty_id)
      .order('year', { ascending: false })
      .limit(5);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Faculty_Report_${profile.employee_id}.pdf`);

    doc.pipe(res);

    generateCoverPage(doc, profile);
    doc.addPage();
    generateResearchSummary(doc, profile, publications || []);
    doc.addPage();
    generateActivitiesSummary(doc, activities || []);
    doc.addPage();
    generateAdminInsights(doc, profile, activities || [], publications || []);

    doc.end();

    console.log(`PDF report generated for faculty: ${faculty_id}`);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Report generation failed'
    });
  }
};

function generateCoverPage(doc, profile) {
  doc.fontSize(24).font('Helvetica-Bold').text('FACULTY PERFORMANCE APPRAISAL REPORT', { align: 'center' });

  doc.moveDown(2);

  doc.fontSize(12).font('Helvetica');
  doc.text('Institution Name: _________________________________', { align: 'center' });

  doc.moveDown(1);

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Report Date: ${reportDate}`, { align: 'center' });

  doc.moveDown(3);

  doc.fontSize(16).font('Helvetica-Bold').text('FACULTY DETAILS', { underline: true });
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold');
  const details = [
    { label: 'Name:', value: profile.full_name },
    { label: 'Department:', value: profile.department },
    { label: 'Designation:', value: profile.designation },
    { label: 'Employee ID:', value: profile.employee_id },
    { label: 'Google Scholar ID:', value: profile.google_scholar_id || 'Not Linked' }
  ];

  details.forEach(detail => {
    doc.font('Helvetica-Bold').text(detail.label, { continued: true });
    doc.font('Helvetica').text(' ' + detail.value);
    doc.moveDown(0.5);
  });

  doc.moveDown(3);

  doc.fontSize(10).font('Helvetica').fillColor('#666666')
    .text('This is an auto-generated performance report based on submitted academic activities and research metrics.', { align: 'center' });
}

function generateResearchSummary(doc, profile, publications) {
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text('RESEARCH PERFORMANCE SUMMARY', { underline: true });
  doc.moveDown(1.5);

  doc.fontSize(12).font('Helvetica');

  const metrics = [
    { label: 'Total Publications:', value: profile.total_publications || 0 },
    { label: 'Total Citations:', value: profile.total_citations || 0 },
    { label: 'h-index:', value: profile.h_index || 0 },
    { label: 'Performance Score:', value: profile.performance_score ? `${profile.performance_score}/100` : 'Not Analyzed' },
    { label: 'Performance Category:', value: profile.performance_category || 'Pending' }
  ];

  metrics.forEach(metric => {
    doc.font('Helvetica-Bold').text(metric.label, { continued: true });
    doc.font('Helvetica').text(' ' + metric.value);
    doc.moveDown(0.5);
  });

  doc.moveDown(2);

  doc.fontSize(14).font('Helvetica-Bold').text('TOP 5 PUBLICATIONS');
  doc.moveDown(1);

  if (publications.length > 0) {
    doc.fontSize(10).font('Helvetica-Bold');

    const tableTop = doc.y;
    const colWidths = { year: 50, title: 200, journal: 150, citations: 70 };
    let currentY = tableTop;

    doc.rect(50, currentY, colWidths.year + colWidths.title + colWidths.journal + colWidths.citations, 20)
      .fillAndStroke('#E5E7EB', '#000000');

    doc.fillColor('#000000');
    doc.text('Year', 55, currentY + 5, { width: colWidths.year });
    doc.text('Title', 55 + colWidths.year, currentY + 5, { width: colWidths.title });
    doc.text('Journal', 55 + colWidths.year + colWidths.title, currentY + 5, { width: colWidths.journal });
    doc.text('Citations', 55 + colWidths.year + colWidths.title + colWidths.journal, currentY + 5, { width: colWidths.citations });

    currentY += 20;

    doc.font('Helvetica').fontSize(9);

    publications.forEach((pub, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      const rowHeight = 30;

      if (index % 2 === 0) {
        doc.rect(50, currentY, colWidths.year + colWidths.title + colWidths.journal + colWidths.citations, rowHeight)
          .fill('#F9FAFB');
      }

      doc.fillColor('#000000');
      doc.text(pub.year || 'N/A', 55, currentY + 5, { width: colWidths.year, height: rowHeight });
      doc.text(pub.title || 'N/A', 55 + colWidths.year, currentY + 5, { width: colWidths.title - 10, height: rowHeight });
      doc.text(pub.journal_conference || 'N/A', 55 + colWidths.year + colWidths.title, currentY + 5, { width: colWidths.journal - 10, height: rowHeight });
      doc.text(pub.citations?.toString() || '0', 55 + colWidths.year + colWidths.title + colWidths.journal, currentY + 5, { width: colWidths.citations, height: rowHeight });

      currentY += rowHeight;
    });
  } else {
    doc.fontSize(11).font('Helvetica').fillColor('#666666')
      .text('No publications recorded yet.');
  }
}

function generateActivitiesSummary(doc, activities) {
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text('ACADEMIC & PROFESSIONAL ACTIVITIES', { underline: true });
  doc.moveDown(1.5);

  if (activities.length > 0) {
    doc.fontSize(11).font('Helvetica');

    activities.forEach((activity, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      const activityDate = new Date(activity.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      doc.font('Helvetica-Bold').text(`${index + 1}. ${activity.activity_type}`, { continued: false });
      doc.font('Helvetica').text(`   Title: ${activity.title}`);
      doc.text(`   Date: ${activityDate}`);
      doc.text(`   Status: ${activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}`);

      if (activity.description) {
        doc.fontSize(10).fillColor('#666666').text(`   Description: ${activity.description.substring(0, 150)}${activity.description.length > 150 ? '...' : ''}`);
        doc.fillColor('#000000').fontSize(11);
      }

      doc.moveDown(1);
    });
  } else {
    doc.fontSize(11).font('Helvetica').fillColor('#666666')
      .text('No activities recorded yet.');
  }
}

function generateAdminInsights(doc, profile, activities, publications) {
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text('ADMIN REMARKS (AUTO-GENERATED)', { underline: true });
  doc.moveDown(1.5);

  doc.fontSize(11).font('Helvetica');

  const insights = [];

  if (publications.length >= 3) {
    const years = publications.map(p => p.year).filter(y => y);
    if (years.length >= 2 && years[0] > years[years.length - 1]) {
      insights.push('Publication output has increased in recent years.');
    }
  }

  const totalCitations = profile.total_citations || 0;
  if (totalCitations > 50) {
    insights.push('Strong citation impact demonstrated across published work.');
  } else if (totalCitations > 0) {
    insights.push('Citation metrics show moderate research impact.');
  }

  if (profile.h_index && profile.h_index >= 5) {
    insights.push(`Commendable h-index of ${profile.h_index} indicating consistent research quality.`);
  }

  const workshops = activities.filter(a =>
    a.activity_type === 'Workshop' ||
    a.activity_type === 'Seminar' ||
    a.activity_type === 'FDP / Training'
  );

  if (workshops.length >= 3) {
    insights.push('Active participation in professional development activities.');
  }

  const projects = activities.filter(a => a.activity_type === 'Project');
  if (projects.length === 0) {
    insights.push('Recommended: Increase focus on funded research projects.');
  } else {
    insights.push(`Engaged in ${projects.length} research project${projects.length > 1 ? 's' : ''}.`);
  }

  if (profile.performance_score) {
    if (profile.performance_score >= 80) {
      insights.push('Excellent overall performance score achieved.');
    } else if (profile.performance_score >= 60) {
      insights.push('Good performance with room for strategic improvement.');
    } else {
      insights.push('Performance improvement recommended through increased research output.');
    }
  }

  if (insights.length > 0) {
    insights.forEach((insight, index) => {
      doc.text(`${index + 1}. ${insight}`);
      doc.moveDown(0.8);
    });
  } else {
    doc.fillColor('#666666').text('Insufficient data for generating insights.');
  }

  doc.moveDown(3);

  doc.fontSize(10).fillColor('#000000').font('Helvetica');
  doc.text('_________________________', { align: 'right' });
  doc.text('Admin Signature', { align: 'right' });
  doc.moveDown(0.5);
  doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, { align: 'right' });
}

module.exports = {
  generateReport
};
