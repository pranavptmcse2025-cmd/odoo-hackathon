// Seeds the database with a default admin user and sample governance data
// for demo purposes. Run with: npm run seed
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Policy from "../models/Policy.js";
import Audit from "../models/Audit.js";
import ComplianceIssue from "../models/ComplianceIssue.js";

const run = async () => {
  await connectDB();

  console.log("Clearing existing governance demo data...");
  await Promise.all([Policy.deleteMany({}), Audit.deleteMany({}), ComplianceIssue.deleteMany({})]);

  let admin = await User.findOne({ email: "admin@ecosphere.com" });
  if (!admin) {
    admin = await User.create({
      name: "Admin User",
      email: "admin@ecosphere.com",
      password: "Admin@123",
      role: "admin",
      department: "Governance",
    });
    console.log("Created default admin: admin@ecosphere.com / Admin@123");
  } else {
    console.log("Default admin already exists, skipping creation.");
  }

  const policies = await Policy.insertMany([
    {
      title: "Data Privacy Policy",
      description: "Guidelines for handling employee and customer data responsibly.",
      department: "IT",
      effectiveDate: new Date("2025-01-01"),
      status: "Active",
      createdBy: admin._id,
    },
    {
      title: "Anti-Bribery & Corruption Policy",
      description: "Rules preventing bribery and corrupt practices across all departments.",
      department: "Finance",
      effectiveDate: new Date("2025-03-15"),
      status: "Active",
      createdBy: admin._id,
    },
    {
      title: "Supplier Code of Conduct",
      description: "Standards suppliers must meet regarding labor and environmental practices.",
      department: "Procurement",
      effectiveDate: new Date("2026-01-01"),
      status: "Under Review",
      createdBy: admin._id,
    },
  ]);

  const audits = await Audit.insertMany([
    {
      auditName: "Q1 Financial Compliance Audit",
      department: "Finance",
      auditor: "Deloitte India",
      date: new Date("2026-02-10"),
      status: "Completed",
      score: 88,
      createdBy: admin._id,
    },
    {
      auditName: "IT Security & Data Governance Audit",
      department: "IT",
      auditor: "Internal Audit Team",
      date: new Date("2026-05-20"),
      status: "Completed",
      score: 92,
      createdBy: admin._id,
    },
    {
      auditName: "Supplier Ethics Audit",
      department: "Procurement",
      auditor: "EY India",
      date: new Date("2026-08-01"),
      status: "Scheduled",
      score: null,
      createdBy: admin._id,
    },
  ]);

  await ComplianceIssue.insertMany([
    {
      issueTitle: "Missing consent logs for marketing data",
      department: "Marketing",
      severity: "High",
      status: "Open",
      deadline: new Date("2026-08-15"),
      createdBy: admin._id,
    },
    {
      issueTitle: "Vendor contract missing anti-bribery clause",
      department: "Procurement",
      severity: "Medium",
      status: "In Progress",
      deadline: new Date("2026-07-30"),
      createdBy: admin._id,
    },
    {
      issueTitle: "Outdated access control list on finance server",
      department: "IT",
      severity: "Critical",
      status: "Resolved",
      deadline: new Date("2026-06-01"),
      createdBy: admin._id,
    },
  ]);

  console.log(`Seeded ${policies.length} policies, ${audits.length} audits, 3 compliance issues.`);
  console.log("Done.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
