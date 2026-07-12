import mongoose from "mongoose";

const complianceIssueSchema = new mongoose.Schema(
  {
    issueTitle: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deadline: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("ComplianceIssue", complianceIssueSchema);
