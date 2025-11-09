import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  name: {
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
  description: {
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
