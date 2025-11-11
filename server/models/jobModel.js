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
});

export default mongoose.model("Job", jobSchema);