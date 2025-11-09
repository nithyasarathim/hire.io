import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  company_id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  company_name: {
    type: String,
    required: true,
  },
  company_email: {
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
    type: [String],
    default: [],
  },
});

export default mongoose.model("Company", companySchema);
