import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    auditName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    auditor: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Pending"],
      default: "Scheduled",
    },
    score: { type: Number, min: 0, max: 100, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Audit", auditSchema);
