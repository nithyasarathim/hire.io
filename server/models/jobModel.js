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
  },
  location: {
    type: String,
    required: true,
  },
  job_type: {
    type: String,
    enum: ["Internship", "Full-time", "Part-time"],
    required: true,
  },
  salary_range: {
    type: String,
    default: "",
  },
  experience_level: {
    type: String,
    default: "",
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
