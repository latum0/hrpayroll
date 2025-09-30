import { Router } from "express";
import { createContractSalaryComponentController } from "../controllers/contractSalary.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { CreateContractSalaryComponentDto } from "../dtos/contractSalary.dto";
import { asyncWrapper } from "../utils/asyncWrapper";
import { updateContractSalaryComponentController, deleteContractSalaryComponentController } from "../controllers/contractSalary.controller";
import { getContractSalaryComponentByIdController, getContractSalaryComponentsController } from "../controllers/contractSalary.controller";

const router = Router();

router.post("/", authMiddleware, requireRole("ADMIN"), validateDto(CreateContractSalaryComponentDto), asyncWrapper(createContractSalaryComponentController));
router.patch("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(updateContractSalaryComponentController));
router.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(deleteContractSalaryComponentController));
router.get("/", authMiddleware, asyncWrapper(getContractSalaryComponentsController));
router.get("/:id", authMiddleware, asyncWrapper(getContractSalaryComponentByIdController));

export default router;
