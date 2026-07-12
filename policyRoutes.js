import express from "express";
import {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "../controllers/policyController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPolicies).post(protect, adminOnly, createPolicy);

router
  .route("/:id")
  .get(protect, getPolicyById)
  .put(protect, adminOnly, updatePolicy)
  .delete(protect, adminOnly, deletePolicy);

export default router;
