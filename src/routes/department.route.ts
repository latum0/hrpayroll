import { Router } from "express";
import {
    createDepartmentController,
    updateDepartmentController,
    getDepartmentByIdController,
    getDepartmentsController,
    deleteDepartmentController
} from "../controllers/department.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { CreateDepartmentDto, UpdateDepartmentDto } from "../dtos/department.dto";
import { asyncWrapper } from "../utils/asyncWrapper";

const router = Router();

router.post(
    "/",
    authMiddleware,
    requireRole("ADMIN"),
    validateDto(CreateDepartmentDto),
    asyncWrapper(createDepartmentController)
);

router.get("/", authMiddleware, asyncWrapper(getDepartmentsController));

router.get("/:id", authMiddleware, asyncWrapper(getDepartmentByIdController));

router.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    validateDto(UpdateDepartmentDto),
    asyncWrapper(updateDepartmentController)
);

router.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(deleteDepartmentController));

export default router;
