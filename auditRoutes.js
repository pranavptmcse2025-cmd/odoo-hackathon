import express from "express";
import {
  getAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit,
} from "../controllers/auditController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getAudits).post(protect, adminOnly, createAudit);

router
  .route("/:id")
  .get(protect, getAuditById)
  .put(protect, adminOnly, updateAudit)
  .delete(protect, adminOnly, deleteAudit);

export default router;
