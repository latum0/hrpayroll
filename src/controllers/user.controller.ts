import { Request, Response, NextFunction } from "express";
import { CreateUserDto } from "../dtos/user.dto";
import { createUserService } from "../services/user.service";






export async function createUserController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateUserDto;
    const { data, message, statusCode } = await createUserService(dto);
    res.status(statusCode).json({ data, message })
} 