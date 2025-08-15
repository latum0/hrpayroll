import { Router } from "express";
import {
    createRoleController,
    updateRoleController,
    getRoleByIdController,
    getRolesController,
    deleteRoleController
} from "../controllers/role.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { CreateRoleDto, UpdateRoleDto } from "../dtos/role.dto";

const router = Router();

router.post("/", authMiddleware, requireRole("ADMIN"), validateDto(CreateRoleDto), createRoleController);
router.get("/", authMiddleware, requireRole("ADMIN"), getRolesController);
router.get("/:id", authMiddleware, requireRole("ADMIN"), getRoleByIdController);
router.put("/:id", authMiddleware, requireRole("ADMIN"), validateDto(UpdateRoleDto), updateRoleController);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), deleteRoleController);

export default router;
