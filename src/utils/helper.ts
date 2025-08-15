import bcrypt from "bcrypt";
import { ConflictError, NotFoundError, UnauthorizedError } from "./errors";
import { NextFunction, Response, Request } from "express";



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
    if (check === null || !check) {
        throw new NotFoundError(`${entity}`);
    }
    return check;
}

export async function ensureUnique<T>(find: () => Promise<T | null>, entity: string): Promise<void> {
    const check = await find();
    if (check) {
        throw new ConflictError(`${entity} already exists`)
    }
}

export function stripNullish<T extends object>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== null && v !== undefined)
    ) as Partial<T>;
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


export function getIdAndActeur(req: Request): { id: number; acteur: string } {
    const id = req.user?.id;
    const acteur = req.user?.name;

    if (!id || !acteur || id === undefined || id === null) {
        throw new UnauthorizedError("Invalid or expired token");
    }

    return { id, acteur };
}
