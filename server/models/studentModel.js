import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  student_name: {
    type: String,
    required: true,
  },
  student_email: {
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
  resume: {
    type: String,
  },
  skills: {
    type: [String],
    default: [],
  },
});

export default mongoose.model("Student", studentSchema);
