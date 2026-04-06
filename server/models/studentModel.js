import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  student_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  current_status: {
    type: String,
    enum: ["active", "notactive"],
    default: "active",
  },
  student_description: {
    type: String,
  },
  resumeId: {
    type: String,
    default: null,
  },
  skills: {
    type: [String],
    default: [],
  },
  portfolio_url: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
