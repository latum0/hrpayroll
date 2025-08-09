import { Router } from "express";
import {
    createUserController,
    updateUserController,
    getUserByIdController,
    getUsersController,
    deleteUserController,
    updateOwnProfileController,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateDto } from "../middlewares/validateDto";
import { CreateUserDto, UpdateOwnUserDto, UpdateUserDto } from "../dtos/user.dto";
import { requireRole } from "../middlewares/authorization";




const router = Router();

router.post(
    "/",
    authMiddleware,
    requireRole("ADMIN"),
    validateDto(CreateUserDto),
    createUserController
);

router.get(
    "/",
    authMiddleware,
    requireRole("ADMIN"),
    getUsersController
);

router.get(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    getUserByIdController
);
//for self 
router.patch(
    "/me",
    authMiddleware,
    validateDto(UpdateOwnUserDto),
    updateOwnProfileController
);

//for admin
router.patch(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    validateDto(UpdateUserDto),
    updateUserController
);



router.delete(
    "/:id",
    authMiddleware,
    requireRole("ADMIN"),
    deleteUserController
);
export default router;