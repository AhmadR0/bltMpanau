import { Router } from "express";
import * as authController from "../controller/authController.js";
import { authenticateJWT } from "../utils/authMiddleware.js";

const router: Router = Router();

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticateJWT, authController.me);

export default router;
