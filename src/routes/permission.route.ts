// routes/permissions.route.ts
import { Router } from "express";
import {
    createPermissionController,
    updatePermissionController,
    getPermissionByIdController,
    getPermissionsController,
    deletePermissionController,
} from "../controllers/permission.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { CreatePermissionDto, UpdatePermissionDto } from "../dtos/permission.dto";

const router = Router();

router.post("/", authMiddleware, requireRole("ADMIN"), validateDto(CreatePermissionDto), createPermissionController);
router.get("/", authMiddleware, requireRole("ADMIN"), getPermissionsController);
router.get("/:id", authMiddleware, requireRole("ADMIN"), getPermissionByIdController);
router.put("/:id", authMiddleware, requireRole("ADMIN"), validateDto(UpdatePermissionDto), updatePermissionController);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), deletePermissionController);

export default router;
