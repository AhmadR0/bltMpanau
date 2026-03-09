import { Router } from "express";
import * as wargaController from "../controller/wargaController.js";
import { authenticateJWT } from "../utils/authMiddleware.js";
import { uploadWargaFiles } from "../utils/uploadMiddleware.js";

const router: Router = Router();

router.post(
    "/generate", 
    authenticateJWT, 
    wargaController.generateWarga
);


router.get(
    "/", 
    authenticateJWT, 
    wargaController.getAllWarga
);

router.get(
    '/:id',
    authenticateJWT,
    wargaController.getWargaByid
)

router.put(
    "/uploadForm", 
    authenticateJWT, 
    uploadWargaFiles,
    wargaController.updateDataMandiri,
);

router.get(
    "/:id", 
    authenticateJWT, 
    wargaController.getWargaDetail
);

router.patch("/verify/:id", authenticateJWT, wargaController.adminVerifyWarga);
router.delete("/:id", authenticateJWT, wargaController.deleteWarga);

export default router;
