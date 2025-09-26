import { Router } from "express";
import { createAbsenceController } from "../controllers/absence.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateDto } from "../middlewares/validateDto";
import { asyncWrapper } from "../utils/asyncWrapper";
import { CreateAbsenceDto } from "../dtos/absence.dto";
import { UpdateAbsenceDto } from "../dtos/absence.dto";
import { updateAbsenceController, deleteAbsenceController } from "../controllers/absence.controller";
import { getAbsenceByIdController, getAbsencesController } from "../controllers/absence.controller";
import { requireRole } from "../middlewares/authorization";

const router = Router();

router.post(
    "/",
    authMiddleware,
    requireRole("MANAGER"),
    validateDto(CreateAbsenceDto),
    asyncWrapper(createAbsenceController)
);

router.patch(
    "/:id",
    authMiddleware,
    requireRole("MANAGER"),
    validateDto(UpdateAbsenceDto),
    asyncWrapper(updateAbsenceController)
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole("MANAGER"),
    asyncWrapper(deleteAbsenceController)
);

router.get(
    "/",
    authMiddleware,
    asyncWrapper(getAbsencesController)
);

router.get(
    "/:id",
    authMiddleware,
    asyncWrapper(getAbsenceByIdController)
);

export default router;
