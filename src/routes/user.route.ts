import { Router } from "express";
import { createUserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateDto } from "../middlewares/validateDto";
import { CreateUserDto } from "../dtos/user.dto";
import { requireRole } from "../middlewares/authorization";




const router = Router();

router.post('/', authMiddleware, requireRole("ADMIN"), validateDto(CreateUserDto), createUserController)  //role 

export default router;