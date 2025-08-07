import bcrypt from "bcrypt";
import { NotFoundError } from "./errors";
import { Response } from "express";



export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export const checkPassword = async (userPassword: string, hashedPassword: string) => {
    const check = await bcrypt.compare(userPassword, hashedPassword)
    if (!check) {
        throw new Error("email or password is invalid")
    }
}


export async function ensureExists<T>(find: () => Promise<T | null>, entity: string): Promise<T> {
    const check = await find();
    if (check === null) {
        throw new NotFoundError(`${entity}`);
    }
    return check;
}


export const tokenStoredCookie = async (res: Response, data: string) => {
    res.cookie("refreshToken", data, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })
}
