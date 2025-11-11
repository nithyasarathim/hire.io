

import cors from 'cors';
import express from "express";
import connectDB from "./configs/db.js";
import requestLogger from "./middlewares/requestLogger.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routers/authRoutes.js";
import jobRoutes from "./routers/jobRoutes.js";
import companyRoutes from "./routers/companyRoutes.js";
import studentRoutes from "./routers/studentRoutes.js";
import adminRoutes from "./routers/adminRoutes.js";
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admins", adminRoutes);

app.use(errorHandler);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
