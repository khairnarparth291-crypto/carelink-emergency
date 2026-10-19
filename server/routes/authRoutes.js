import express from "express";
import { loginUser, getMe, getHealth } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/health", getHealth);

export default router;
