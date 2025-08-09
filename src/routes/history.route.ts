import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { asyncWrapper } from "../utils/asyncWrapper";
import { getAllHistoriquesController, getHistoriqueByIdController, deleteHistoriqueByIdController, deleteOldHistoriquesController } from "../controllers/historique.controller";

const router = Router();
router.get(
    "/",
    authMiddleware,
    requireRole("ADMIN"),
    asyncWrapper(getAllHistoriquesController)
);
router.get(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    asyncWrapper(getHistoriqueByIdController)
);
router.delete(
    "/old",
    authMiddleware,
    requireRole("ADMIN"),
    asyncWrapper(deleteOldHistoriquesController)
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    asyncWrapper(deleteHistoriqueByIdController)
);

export default router; 