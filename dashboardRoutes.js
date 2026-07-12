import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGovernanceDashboard,
  getGovernanceReport,
  getOverviewDashboard,
  proxyEnvironmentDashboard,
  proxyEnvironmentReport,
  proxySocialDashboard,
  proxyLeaderboard,
  proxyActivities,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Governance-specific
router.get("/dashboard/governance", protect, getGovernanceDashboard);
router.get("/reports/governance", protect, getGovernanceReport);

// Aggregated across all three modules
router.get("/dashboard/overview", protect, getOverviewDashboard);

// Integration passthroughs to Environmental / Social modules
router.get("/dashboard/environment", protect, proxyEnvironmentDashboard);
router.get("/reports/environment", protect, proxyEnvironmentReport);
router.get("/dashboard/social", protect, proxySocialDashboard);
router.get("/leaderboard", protect, proxyLeaderboard);
router.get("/activities", protect, proxyActivities);

export default router;
