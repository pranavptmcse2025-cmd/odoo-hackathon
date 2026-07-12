import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Policy from "../models/Policy.js";

// @desc    Get all policies (supports ?department= & ?status= filters)
// @route   GET /api/policies
// @access  Private
export const getPolicies = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.status) filter.status = req.query.status;

  const policies = await Policy.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: policies.length, data: policies });
});

// @desc    Get single policy by ID
// @route   GET /api/policies/:id
// @access  Private
export const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id);
  if (!policy) throw new ApiError(404, "Policy not found");
  res.status(200).json({ success: true, data: policy });
});

// @desc    Create a policy
// @route   POST /api/policies
// @access  Private/Admin
export const createPolicy = asyncHandler(async (req, res) => {
  const { title, description, department, effectiveDate, status } = req.body;

  if (!title || !description || !department || !effectiveDate) {
    throw new ApiError(400, "title, description, department and effectiveDate are required");
  }

  const policy = await Policy.create({
    title,
    description,
    department,
    effectiveDate,
    status,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Policy created", data: policy });
});

// @desc    Update a policy
// @route   PUT /api/policies/:id
// @access  Private/Admin
export const updatePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!policy) throw new ApiError(404, "Policy not found");
  res.status(200).json({ success: true, message: "Policy updated", data: policy });
});

// @desc    Delete a policy
// @route   DELETE /api/policies/:id
// @access  Private/Admin
export const deletePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findByIdAndDelete(req.params.id);
  if (!policy) throw new ApiError(404, "Policy not found");
  res.status(200).json({ success: true, message: "Policy deleted" });
});
