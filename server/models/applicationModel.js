import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  status: {
    type: String,
    enum: ["Applied", "Interviewing", "Offered", "Rejected"],
    default: "Applied",
  },
  engagement_type: {
    type: String,
    enum: ["Student Interest", "Company Outreach"],
    default: "Student Interest",
  },
  match_score: {
    type: Number,
    default: 0,
  },
  matched_skills: {
    type: [String],
    default: [],
  },
  missing_skills: {
    type: [String],
    default: [],
  },
  company_viewed_profile_at: {
    type: Date,
    default: null,
  },
  company_contacted_at: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

applicationSchema.index({ student: 1, job: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
