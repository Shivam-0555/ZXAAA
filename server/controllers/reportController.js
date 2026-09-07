import Report from '../models/Report.js';

// @desc Create a new report
// @route POST /api/reports
// @access Private
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const reportedBy = req.user._id;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'Target type, target ID, and reason are required' });
    }

    const report = await Report.create({
      reportedBy,
      targetType,
      targetId,
      reason,
      details: details || '',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Admin will review your report.',
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all reports (Admin only)
// @route GET /api/reports
// @access Private/Admin
export const getReports = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const reports = await Report.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Resolve or reject a report (Admin only)
// @route PUT /api/reports/:id
// @access Private/Admin
export const updateReportStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status || report.status;
    report.adminNotes = adminNotes || report.adminNotes;
    await report.save();

    res.json({ success: true, message: `Report status updated to ${report.status}`, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
