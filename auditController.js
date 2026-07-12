import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Audit from "../models/Audit.js";

// @desc    Get all audits (supports ?department= & ?status= filters)
// @route   GET /api/audits
// @access  Private
export const getAudits = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.status) filter.status = req.query.status;

  const audits = await Audit.find(filter).sort({ date: -1 });
  res.status(200).json({ success: true, count: audits.length, data: audits });
});

// @desc    Get single audit by ID
// @route   GET /api/audits/:id
// @access  Private
export const getAuditById = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) throw new ApiError(404, "Audit not found");
  res.status(200).json({ success: true, data: audit });
});

// @desc    Create an audit
// @route   POST /api/audits
// @access  Private/Admin
export const createAudit = asyncHandler(async (req, res) => {
  const { auditName, department, auditor, date, status, score } = req.body;

  if (!auditName || !department || !auditor || !date) {
    throw new ApiError(400, "auditName, department, auditor and date are required");
  }

  const audit = await Audit.create({
    auditName,
    department,
    auditor,
    date,
    status,
    score,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Audit created", data: audit });
});

// @desc    Update an audit
// @route   PUT /api/audits/:id
// @access  Private/Admin
export const updateAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!audit) throw new ApiError(404, "Audit not found");
  res.status(200).json({ success: true, message: "Audit updated", data: audit });
});

// @desc    Delete an audit
// @route   DELETE /api/audits/:id
// @access  Private/Admin
export const deleteAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findByIdAndDelete(req.params.id);
  if (!audit) throw new ApiError(404, "Audit not found");
  res.status(200).json({ success: true, message: "Audit deleted" });
});
