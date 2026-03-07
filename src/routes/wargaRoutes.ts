import { Router } from "express";
import * as wargaController from "../controller/wargaController.js";
import { authenticateJWT } from "../utils/authMiddleware.js";
import { uploadWargaFiles } from "../utils/uploadMiddleware.js";

const router: Router = Router();

// Endpoint ini biasanya hanya untuk Admin
router.post("/generate", authenticateJWT, wargaController.generateWarga);
router.get("/", authenticateJWT, wargaController.getAllWarga);

// FLOW 2: Warga melengkapi data (Self-service)
router.put(
    "/uploadForm", 
    authenticateJWT, 
    uploadWargaFiles,
    wargaController.updateDataMandiri,
);

// FLOW 3: Admin Management & Verification
router.get("/:id", authenticateJWT, wargaController.getWargaDetail);
router.patch("/verify/:id", authenticateJWT, wargaController.adminVerifyWarga);
router.delete("/:id", authenticateJWT, wargaController.deleteWarga);

export default router;
