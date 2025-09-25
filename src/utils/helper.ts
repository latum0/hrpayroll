import bcrypt from "bcrypt";
import { ConflictError, NotFoundError, UnauthorizedError } from "./errors";
import { NextFunction, Response, Request } from "express";
import { AttendanceResponseDto } from "../dtos/reponses.dto";



export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export const checkPassword = async (userPassword: string, hashedPassword: string) => {
    const check = await bcrypt.compare(userPassword, hashedPassword)
    if (!check) {
        throw new UnauthorizedError("email or password is invalid")
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



export const tokenStoredCookie = (res: Response, data: string) => {
    res.cookie("refreshToken", data, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })
}



export function getIdAndActeur(req: Request): { id: number; acteur: string } {
    const user = (req as any).user;
    if (!user) {
        throw new UnauthorizedError("Invalid or expired token");
    }

    const idActeur = user.sub ?? user.id ?? user.userId;
    const id = Number(idActeur);
    if (!id || Number.isNaN(id) || id <= 0) {
        throw new UnauthorizedError("Invalid or expired token");
    }

    const fullName =
        (typeof user.name === "string" && user.name.trim()) ||
        (`${(user.firstName ?? "").toString().trim()} ${(user.lastName ?? "").toString().trim()}`.trim()) ||
        user.email ||
        `user#${id}`;

    return { id, acteur: fullName };
}

export function extractCompanyId(req: Request): number | undefined {
    const u = (req as any).user;
    if (!u) return undefined;
    const cid = u.companyId;
    if (cid === undefined || cid === null || cid === "") return undefined;
    const num = Number(cid);
    return Number.isNaN(num) ? undefined : num;
}

export function startOfDayUTC(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

export function createPayloadAttendanceResponse(
    createdAt: string,
    checkIn: string,
    checkOut: string,
    employeeId: number,
    employeeName: string,
    validatedById: number,
    note: string | null,
    payrollRunId: number | null) {
    const payload: AttendanceResponseDto = {
        checkIn,
        checkOut,
        createdAt,
        payrollRunId,
        note,
        employee: {
            id: employeeId,
            firstName: employeeName
        },
        validatedById
    }

    return payload;

}


export default {
    hashPassword,
    checkPassword,
    ensureExists,
    ensureUnique,
    stripNullish,
    tokenStoredCookie,
    getIdAndActeur,
    extractCompanyId,
};

