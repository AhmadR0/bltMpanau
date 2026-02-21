import { Router } from "express";
import * as wargaController from "../controller/wargaController.js";
import { authenticateJWT } from "../utils/authMiddleware.js";

const router: Router = Router();

// Endpoint ini biasanya hanya untuk Admin
router.post("/generate", authenticateJWT, wargaController.generateWarga);
router.get("/", authenticateJWT, wargaController.getAllWarga);

export default router;
