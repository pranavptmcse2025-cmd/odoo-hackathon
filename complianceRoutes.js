import express from "express";
import {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} from "../controllers/complianceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Any authenticated user can raise an issue and view issues.
// Update (assign / resolve / change status) is also open to authenticated
// users so an assignee can mark their own issue resolved; deletion is admin-only.
router.route("/").get(protect, getIssues).post(protect, createIssue);

router
  .route("/:id")
  .get(protect, getIssueById)
  .put(protect, updateIssue)
  .delete(protect, adminOnly, deleteIssue);

export default router;
