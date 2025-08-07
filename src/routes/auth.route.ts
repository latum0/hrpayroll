import { Router } from "express";
import { changePasswordController, forgotPasswordController, getProfileController, loginController, refreshAccessTokenController, resetPasswordController, verifyEmailController, signUpController } from "../controllers/auth.controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import { authMiddleware } from "../middlewares/authMiddleware";

import { ChangePasswordDto, CreateUserDto, LoginDto } from "../dtos/user.dto";
import { validateDto } from "../middlewares/validateDto";




const router = Router();

router.post('/signup', validateDto(CreateUserDto), asyncWrapper(signUpController));
router.post('/', validateDto(LoginDto), asyncWrapper(loginController));
router.post('/refresh', asyncWrapper(refreshAccessTokenController))
router.get("/profile", authMiddleware, asyncWrapper(getProfileController));
router.get("/verify-email", asyncWrapper(verifyEmailController));
router.post("/forgot-password", validateDto(ChangePasswordDto), asyncWrapper(forgotPasswordController));
router.post("/reset-password", asyncWrapper(resetPasswordController));
router.post("/change-password", authMiddleware, asyncWrapper(changePasswordController));

export default router;