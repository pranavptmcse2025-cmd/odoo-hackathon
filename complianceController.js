import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ComplianceIssue from "../models/ComplianceIssue.js";

// @desc    Get all compliance issues (supports ?department=, ?status=, ?severity=)
// @route   GET /api/issues
// @access  Private
export const getIssues = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.severity) filter.severity = req.query.severity;

  const issues = await ComplianceIssue.find(filter)
    .populate("assignedTo", "name email department")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: issues.length, data: issues });
});

// @desc    Get single compliance issue
// @route   GET /api/issues/:id
// @access  Private
export const getIssueById = asyncHandler(async (req, res) => {
  const issue = await ComplianceIssue.findById(req.params.id).populate(
    "assignedTo",
    "name email department"
  );
  if (!issue) throw new ApiError(404, "Compliance issue not found");
  res.status(200).json({ success: true, data: issue });
});

// @desc    Raise a new compliance issue
// @route   POST /api/issues
// @access  Private
export const createIssue = asyncHandler(async (req, res) => {
  const { issueTitle, department, severity, assignedTo, deadline } = req.body;

  if (!issueTitle || !department) {
    throw new ApiError(400, "issueTitle and department are required");
  }

  const issue = await ComplianceIssue.create({
    issueTitle,
    department,
    severity,
    assignedTo,
    deadline,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Compliance issue raised", data: issue });
});

// @desc    Update a compliance issue (assign, change severity/status/deadline)
// @route   PUT /api/issues/:id
// @access  Private/Admin
export const updateIssue = asyncHandler(async (req, res) => {
  const issue = await ComplianceIssue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("assignedTo", "name email department");

  if (!issue) throw new ApiError(404, "Compliance issue not found");
  res.status(200).json({ success: true, message: "Compliance issue updated", data: issue });
});

// @desc    Delete a compliance issue
// @route   DELETE /api/issues/:id
// @access  Private/Admin
export const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await ComplianceIssue.findByIdAndDelete(req.params.id);
  if (!issue) throw new ApiError(404, "Compliance issue not found");
  res.status(200).json({ success: true, message: "Compliance issue deleted" });
});
