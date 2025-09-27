import { Router } from "express";
import { createContractController, deleteContractController, updateContractController, getContractsController, getContractByIdController } from "../controllers/contract.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateDto } from "../middlewares/validateDto";
import { asyncWrapper } from "../utils/asyncWrapper";
import { requireRole } from "../middlewares/authorization";
import { CreateContractDto } from "../dtos/contract.dto";

const router = Router();

router.post("/", authMiddleware, requireRole("ADMIN"), validateDto(CreateContractDto), asyncWrapper(createContractController));

router.patch("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(updateContractController));

router.get("/", authMiddleware, asyncWrapper(getContractsController));
router.get("/:id", authMiddleware, asyncWrapper(getContractByIdController));

router.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(deleteContractController));

export default router;
