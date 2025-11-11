import express from "express";
import authController from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/sso/student", authController.ssoStudent);
router.get("/profile", authenticate, authController.profile);

export default router;