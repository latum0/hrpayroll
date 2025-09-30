import { Router } from "express";
import { createSalaryComponentController } from "../controllers/salaryComponent.controller";
import { getSalaryComponentsController, getSalaryComponentByIdController } from "../controllers/salaryComponent.controller";
import { updateSalaryComponentController, deleteSalaryComponentController } from "../controllers/salaryComponent.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { CreateSalaryComponentDto } from "../dtos/salaryComponent.dto";
import { asyncWrapper } from "../utils/asyncWrapper";

const router = Router();

router.post("/", authMiddleware, requireRole("ADMIN"), validateDto(CreateSalaryComponentDto), asyncWrapper(createSalaryComponentController));

router.get("/", authMiddleware, asyncWrapper(getSalaryComponentsController));
router.get("/:id", authMiddleware, asyncWrapper(getSalaryComponentByIdController));
router.patch("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(updateSalaryComponentController));
router.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(deleteSalaryComponentController));

export default router;
