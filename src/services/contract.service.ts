import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "../config/database";
import { CreateContractDto, UpdateContractDto } from "../dtos/contract.dto";
import { ServiceResponse } from "../types/service";
import { ensureExists, ensureUnique } from "../utils/helper";
import { BadRequestError, ConflictError } from "../utils/errors";
import { createHistoryService } from "./history.service";
import { EmploymentContractResponseDto } from "../dtos/reponses.dto";
import { toEmploymentContractResponseDto } from "../utils/responseHelpers";
import { EmploymentContractListResponseDto } from "../dtos/reponses.dto";

export async function createContractService(dto: CreateContractDto, actorId: number, actor: string): Promise<ServiceResponse<EmploymentContractResponseDto>> {
    await ensureExists(() => prisma.employee.findUnique({ where: { id: dto.employeeId }, include: { user: true } }), "Employee");
    await ensureUnique(() => prisma.employmentContract.findFirst({ where: { employeeId: dto.employeeId } }), "Employee")

    try {
        const created = await prisma.$transaction(async (tx) => {
            const c = await tx.employmentContract.create({
                data: {
                    employeeId: dto.employeeId,
                    title: dto.title ?? null,
                    startDate: new Date(dto.startDate),
                    endDate: dto.endDate ? new Date(dto.endDate) : null,
                    payFrequency: dto.payFrequency ?? undefined,
                    payType: dto.payType ?? undefined,
                    status: dto.status ?? undefined,
                }
            });

            await createHistoryService(tx, actorId, actor, `Created contract #${c.id} for employee ${dto.employeeId}`);

            const withRelations = await tx.employmentContract.findUnique({ where: { id: c.id }, include: { employee: { select: { id: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } } } } });
            return withRelations;
        });

        if (!created) throw new BadRequestError("Failed to create contract");

        const payload = toEmploymentContractResponseDto(created);
        return { statusCode: 201, data: payload, message: "Contract created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("EmploymentContract", "unique constraint");
        }
        throw err;
    }
}

export async function deleteContractService(id: number, actorId: number, actor: string): Promise<ServiceResponse<void>> {
    await ensureExists(() => prisma.employmentContract.findUnique({ where: { id } }), "EmploymentContract");

    await prisma.$transaction(async (tx) => {
        await tx.employmentContract.delete({ where: { id } });
        await createHistoryService(tx, actorId, actor, `Deleted contract ID=${id}`);
    });

    return { statusCode: 200, message: "Contract deleted." };
}

export async function updateContractService(id: number, dto: UpdateContractDto, actorId: number, actor: string): Promise<ServiceResponse<EmploymentContractResponseDto>> {
    try {
        await ensureExists(() => prisma.employmentContract.findUnique({ where: { id }, include: { employee: true } }), "EmploymentContract");

        const data: any = {};
        if (dto.employeeId !== undefined) {
            await ensureExists(() => prisma.employee.findUnique({ where: { id: dto.employeeId } }), "Employee");
            data.employeeId = dto.employeeId;
        }
        if (dto.title !== undefined) data.title = dto.title ?? null;
        if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
        if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
        if (dto.payFrequency !== undefined) data.payFrequency = dto.payFrequency ?? null;
        if (dto.payType !== undefined) data.payType = dto.payType ?? null;
        if (dto.status !== undefined) data.status = dto.status ?? null;

        const updated = await prisma.$transaction(async (tx) => {
            const up = await tx.employmentContract.update({ where: { id }, data, include: { employee: { select: { id: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } } } } });
            await createHistoryService(tx, actorId, actor, `Updated contract ID=${id}`);
            return up;
        });

        const payload = toEmploymentContractResponseDto(updated);
        return { statusCode: 200, data: payload, message: "Contract updated." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === "P2025") throw new BadRequestError("Contract not found");
            if (err.code === "P2003") throw new BadRequestError("Invalid foreign key reference");
            if (err.code === "P2002") throw new ConflictError("Unique constraint violation");
        }
        throw err;
    }
}




export async function getContractByIdService(id: number): Promise<ServiceResponse<EmploymentContractResponseDto>> {
    const c = await ensureExists(() => prisma.employmentContract.findUnique({ where: { id }, include: { employee: { select: { id: true, user: { select: { id: true, email: true } } } } } }), "EmploymentContract");
    const payload = toEmploymentContractResponseDto(c);
    return { statusCode: 200, data: payload, message: "Contract fetched." };
}

export async function getContractsService(options?: { page?: number; limit?: number; search?: string; employeeId?: number; status?: string; sortBy?: string; order?: string }): Promise<ServiceResponse<EmploymentContractListResponseDto>> {
    const { page = 1, limit = 10, search, employeeId, status, sortBy = "id", order = "asc" } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ["id", "startDate", "createdAt", "status"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const where: any = {};
    if (typeof employeeId === "number") where.employeeId = employeeId;
    if (typeof status === "string" && status.trim().length > 0) where.status = status;

    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [
            { title: { contains: q } },
            { employee: { user: { firstName: { contains: q } } } },
            { employee: { user: { lastName: { contains: q } } } },
            { employee: { user: { email: { contains: q } } } },
        ];
    }

    const [total, rows] = await Promise.all([
        prisma.employmentContract.count({ where }),
        prisma.employmentContract.findMany({
            where,
            include: { employee: { select: { id: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } } } },
            orderBy: { [sortField]: sortOrder },
            skip,
            take: safeLimit,
        }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
    const mapped = rows.map((c) => toEmploymentContractResponseDto(c));

    const result: EmploymentContractListResponseDto = {
        contracts: mapped,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
    };

    return { statusCode: 200, data: result, message: "Contracts fetched." };
}
