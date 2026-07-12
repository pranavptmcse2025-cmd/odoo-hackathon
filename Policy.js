import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    department: { type: String, required: true, trim: true },
    effectiveDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Draft", "Active", "Under Review", "Archived"],
      default: "Draft",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Policy", policySchema);
