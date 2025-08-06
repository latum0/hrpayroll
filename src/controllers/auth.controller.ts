import { Request, Response, NextFunction } from "express";
import { ServiceResponse } from "../types/service";
import { loginService } from "../services/auth.service";




export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email, password } = req.body;
    const { statusCode, data } = await loginService(email, password)
    res.cookie("refreshToken", data?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh",
        maxAge: 1000 * 60 * 60 * 24 * 7

    })

}