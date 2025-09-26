import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "../config/database";
import { CreateAbsenceDto, UpdateAbsenceDto } from "../dtos/absence.dto";
import { ServiceResponse } from "../types/service";
import { ensureExists, startOfDayUTC } from "../utils/helper";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";
import { createHistoryService } from "./history.service";
import { AbsenceResponseDto } from "../dtos/reponses.dto";
import { toAbsenceResponseDto } from "../utils/responseHelpers";

export async function createAbsenceService(dto: CreateAbsenceDto, actorId: number, actor: string): Promise<ServiceResponse<AbsenceResponseDto>> {
    const date = new Date(dto.date);
    const day = startOfDayUTC(date);

    const employee = await ensureExists(() => prisma.employee.findUnique({ where: { id: dto.employeeId }, include: { user: true } }), "Employee");

    if (dto.leaveRequestId !== undefined && dto.leaveRequestId !== null) {
        const lrId = Number(dto.leaveRequestId);
        await ensureExists(() => prisma.leaveRequest.findUnique({ where: { id: lrId, employeeId: dto.employeeId } }), "LeaveRequest");
    }

    try {
        const created = await prisma.$transaction(async (tx) => {
            const abs = await tx.absence.create({
                data: {
                    employeeId: dto.employeeId,
                    date: day,
                    type: dto.type as any ?? null,
                    hours: dto.hours ?? null,
                    leaveRequestId: dto.leaveRequestId ?? null,
                    reason: dto.reason ?? null,
                    payrollRunId: dto.payrollRunId ?? null,
                }
            });

            await createHistoryService(tx, actorId, actor, `Created absence #${abs.id} for employee ${employee.id}`);

            const withRelations = await tx.absence.findUnique({ where: { id: abs.id }, include: { employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } } } });

            return withRelations;
        });

        if (!created) {
            throw new BadRequestError("Failed to create absence");
        }

        const payload = toAbsenceResponseDto(created)

        return { statusCode: 201, data: payload, message: "Absence created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === "P2002") throw new ConflictError("Unique constraint violation while creating absence");
            if (err.code === "P2003") throw new BadRequestError("Invalid foreign key reference");
        }
        throw err;
    }
}

export async function updateAbsenceService(id: number, dto: UpdateAbsenceDto, actorId: number, actor: string): Promise<ServiceResponse<AbsenceResponseDto>> {
    try {
        await ensureExists(() => prisma.absence.findUnique({ where: { id }, include: { employee: { select: { id: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } } } } }), "Absence");

        const data: any = {};
        if (dto.employeeId !== undefined) {
            await ensureExists(() => prisma.employee.findUnique({ where: { id: dto.employeeId } }), "Employee");
            data.employeeId = dto.employeeId;
        }
        if (dto.date !== undefined) {
            const day = startOfDayUTC(new Date(dto.date));
            data.date = day;
        }
        if (dto.type !== undefined) data.type = dto.type;
        if (dto.hours !== undefined) data.hours = dto.hours;
        if (dto.leaveRequestId !== undefined) {
            if (dto.leaveRequestId !== null) await ensureExists(() => prisma.leaveRequest.findUnique({ where: { id: Number(dto.leaveRequestId) } }), "LeaveRequest");
            data.leaveRequestId = dto.leaveRequestId ?? null;
        }
        if (dto.reason !== undefined) data.reason = dto.reason;
        if (dto.payrollRunId !== undefined) data.payrollRunId = dto.payrollRunId ?? null;

        const updated = await prisma.$transaction(async (tx) => {
            const up = await tx.absence.update({ where: { id }, data, include: { employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } } } });
            await createHistoryService(tx, actorId, actor, `Updated absence ID=${id}`);
            return up;
        });

        const payload = toAbsenceResponseDto(updated)

        return { statusCode: 200, data: payload, message: "Absence updated." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === "P2025") throw new NotFoundError("Absence");
            if (err.code === "P2003") throw new BadRequestError("Invalid foreign key reference");
            if (err.code === "P2002") throw new ConflictError("Unique constraint violation");
        }
        throw err;
    }
}

export async function deleteAbsenceService(id: number, actorId: number, actor: string): Promise<ServiceResponse<void>> {
    await ensureExists(() => prisma.absence.findUnique({ where: { id } }), "Absence");
    await prisma.$transaction(async (tx) => {
        await tx.absence.delete({ where: { id } });
        await createHistoryService(tx, actorId, actor, `Deleted absence ID=${id}`);
    });

    return { statusCode: 200, message: "Absence deleted." };
}

export async function getAbsenceByIdService(id: number): Promise<ServiceResponse<AbsenceResponseDto>> {
    const a = await ensureExists(() => prisma.absence.findUnique({ where: { id }, include: { employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } } } }), "Absence");

    const payload = toAbsenceResponseDto(a);
    return { statusCode: 200, data: payload, message: "Absence fetched." };
}

export async function getAbsencesService(options?: any): Promise<ServiceResponse<any>> {
    const {
        page = 1,
        limit = 10,
        search,
        employeeId,
        payrollRunId,
        sortBy = "id",
        order = "asc",
    } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ["id", "date", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const where: any = {};
    if (typeof employeeId === "number") where.employeeId = employeeId;
    if (typeof payrollRunId === "number") where.payrollRunId = payrollRunId;

    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [
            { reason: { contains: q } },
            { employee: { user: { firstName: { contains: q } } } },
            { employee: { user: { lastName: { contains: q } } } },
            { employee: { user: { email: { contains: q } } } },
        ];
    }

    const [total, rows] = await Promise.all([
        prisma.absence.count({ where }),
        prisma.absence.findMany({ where, include: { employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } } }, orderBy: { [sortField]: sortOrder }, skip, take: safeLimit })
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

    const mapped = rows.map(r => toAbsenceResponseDto(r));

    const result = {
        absences: mapped,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
    };

    return { statusCode: 200, data: result, message: "Absences fetched." };
}

