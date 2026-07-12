import asyncHandler from "../utils/asyncHandler.js";
import Policy from "../models/Policy.js";
import Audit from "../models/Audit.js";
import ComplianceIssue from "../models/ComplianceIssue.js";
import {
  fetchEnvironmentDashboard,
  fetchEnvironmentReport,
  fetchSocialDashboard,
  fetchLeaderboard,
  fetchActivities,
} from "../utils/integrationClient.js";

// @desc    Governance dashboard summary
// @route   GET /api/dashboard/governance
// @access  Private
export const getGovernanceDashboard = asyncHandler(async (req, res) => {
  const [
    totalPolicies,
    completedAudits,
    pendingAudits,
    openIssues,
    resolvedIssues,
  ] = await Promise.all([
    Policy.countDocuments(),
    Audit.countDocuments({ status: "Completed" }),
    Audit.countDocuments({ status: { $in: ["Scheduled", "In Progress", "Pending"] } }),
    ComplianceIssue.countDocuments({ status: { $in: ["Open", "In Progress"] } }),
    ComplianceIssue.countDocuments({ status: { $in: ["Resolved", "Closed"] } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      policies: totalPolicies,
      completedAudits,
      pendingAudits,
      openComplianceIssues: openIssues,
      resolvedIssues,
    },
  });
});

// @desc    Governance reports summary (policy / audit / compliance)
// @route   GET /api/reports/governance
// @access  Private
export const getGovernanceReport = asyncHandler(async (req, res) => {
  const [policiesByStatus, auditsByStatus, issuesBySeverity] = await Promise.all([
    Policy.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Audit.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ComplianceIssue.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
  ]);

  const avgAuditScoreAgg = await Audit.aggregate([
    { $match: { score: { $ne: null } } },
    { $group: { _id: null, avgScore: { $avg: "$score" } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      policySummary: policiesByStatus,
      auditSummary: {
        byStatus: auditsByStatus,
        averageScore: avgAuditScoreAgg[0]?.avgScore ?? null,
      },
      complianceSummary: issuesBySeverity,
    },
  });
});

// @desc    Aggregated dashboard combining Governance + Environmental + Social
// @route   GET /api/dashboard/overview
// @access  Private
export const getOverviewDashboard = asyncHandler(async (req, res) => {
  const forwardHeaders = { Authorization: req.headers.authorization };

  const [governance, environment, social] = await Promise.all([
    (async () => {
      const [policies, completedAudits, pendingAudits, openIssues, resolvedIssues] =
        await Promise.all([
          Policy.countDocuments(),
          Audit.countDocuments({ status: "Completed" }),
          Audit.countDocuments({ status: { $in: ["Scheduled", "In Progress", "Pending"] } }),
          ComplianceIssue.countDocuments({ status: { $in: ["Open", "In Progress"] } }),
          ComplianceIssue.countDocuments({ status: { $in: ["Resolved", "Closed"] } }),
        ]);
      return {
        ok: true,
        data: { policies, completedAudits, pendingAudits, openComplianceIssues: openIssues, resolvedIssues },
      };
    })(),
    fetchEnvironmentDashboard(forwardHeaders),
    fetchSocialDashboard(forwardHeaders),
  ]);

  res.status(200).json({
    success: true,
    data: { governance, environment, social },
  });
});

// @desc    Proxy: Environmental module dashboard
// @route   GET /api/dashboard/environment
// @access  Private
export const proxyEnvironmentDashboard = asyncHandler(async (req, res) => {
  const result = await fetchEnvironmentDashboard({ Authorization: req.headers.authorization });
  res.status(result.ok ? 200 : 502).json(result);
});

// @desc    Proxy: Environmental module report
// @route   GET /api/reports/environment
// @access  Private
export const proxyEnvironmentReport = asyncHandler(async (req, res) => {
  const result = await fetchEnvironmentReport({ Authorization: req.headers.authorization });
  res.status(result.ok ? 200 : 502).json(result);
});

// @desc    Proxy: Social module dashboard
// @route   GET /api/dashboard/social
// @access  Private
export const proxySocialDashboard = asyncHandler(async (req, res) => {
  const result = await fetchSocialDashboard({ Authorization: req.headers.authorization });
  res.status(result.ok ? 200 : 502).json(result);
});

// @desc    Proxy: Social module leaderboard
// @route   GET /api/leaderboard
// @access  Private
export const proxyLeaderboard = asyncHandler(async (req, res) => {
  const result = await fetchLeaderboard({ Authorization: req.headers.authorization });
  res.status(result.ok ? 200 : 502).json(result);
});

// @desc    Proxy: Social module CSR activities
// @route   GET /api/activities
// @access  Private
export const proxyActivities = asyncHandler(async (req, res) => {
  const result = await fetchActivities({ Authorization: req.headers.authorization });
  res.status(result.ok ? 200 : 502).json(result);
});
