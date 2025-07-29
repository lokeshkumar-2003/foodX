import { Router } from "express";
import { getUser, Login } from "../controllers/auth.js";

const router = Router();

router.post("/auth/login", Login);
router.post("/auth/user", getUser);

export default router;
