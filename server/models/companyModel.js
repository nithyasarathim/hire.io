import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  company_name: {
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
  company_description: {
    type: String,
  },
  company_website: {
    type: String,
  },
  location: {
    type: String,
  },
  jobs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Job",
    default: [],
  },
});

export default mongoose.model("Company", companySchema);