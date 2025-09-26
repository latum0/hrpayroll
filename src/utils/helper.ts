import bcrypt from "bcrypt";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors";
import { Response, Request } from "express";
import { LeaveRequestStatus } from "../../generated/prisma";



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



export function calculateLeaveDays(start: Date, end: Date): number {
    const s = new Date(start);
    const e = new Date(end);
    s.setUTCHours(0, 0, 0, 0);
    e.setUTCHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((e.getTime() - s.getTime()) / msPerDay) + 1;
}


export function validateUpdateLeaveRequest(
    existing: { status: LeaveRequestStatus; payrollRunId?: number | null },
    dto: { status?: LeaveRequestStatus },
    userRole?: string
): void {
    if (existing.status === LeaveRequestStatus.CANCELLED) {
        throw new BadRequestError("Cannot update a cancelled leave request");
    }

    if (existing.payrollRunId != null) {
        throw new ForbiddenError("Cannot update leave request that is already in a payroll run");
    }

    if (dto.status && dto.status !== existing.status) {
        const allowedTransitions: Record<LeaveRequestStatus, LeaveRequestStatus[]> = {
            [LeaveRequestStatus.PENDING]: [
                LeaveRequestStatus.APPROVED,
                LeaveRequestStatus.REJECTED,
                LeaveRequestStatus.CANCELLED
            ],
            [LeaveRequestStatus.APPROVED]: [LeaveRequestStatus.CANCELLED],
            [LeaveRequestStatus.REJECTED]: [LeaveRequestStatus.PENDING],
            [LeaveRequestStatus.CANCELLED]: []
        };

        const allowed = allowedTransitions[existing.status] ?? [];
        if (!allowed.includes(dto.status)) {
            throw new BadRequestError(`Cannot transition from ${existing.status} to ${dto.status}`);
        }
    }

    if (existing.status === LeaveRequestStatus.APPROVED && userRole !== "ADMIN") {
        throw new ForbiddenError("Only administrators can modify approved leave requests");
    }
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

