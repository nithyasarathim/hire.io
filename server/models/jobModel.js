import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  job_id: {
    type: String,
    required: true,
    unique: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Company",
  },
  job_name: {
    type: String,
    required: true,
  },
  job_description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  job_type: {
    type: String,
    enum: ["Internship", "Full-time", "Contract"],
    required: true,
  },
  salary_start: {
    type: Number,
    required: true,
    min: 0,
  },
  salary_end: {
    type: Number,
    required: true,
    min: 0,
  },
  salary_currency: {
    type: String,
    enum: ["INR", "USD"],
    required: true,
  },
  experience_level: {
    type: String,
    required: true,
  },
  skills_required: {
    type: [String],
    required: true,
    default: [],
  },
  opening_status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: null,
  },
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
