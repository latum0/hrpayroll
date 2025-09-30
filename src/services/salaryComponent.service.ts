import { ServiceResponse } from "../types/service";
import { CreateSalaryComponentDto } from "../dtos/salaryComponent.dto";
import prisma from "../config/database";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ConflictError, BadRequestError } from "../utils/errors";
import { ensureExists, ensureUnique } from "../utils/helper";
import { createHistoryService } from "./history.service";
import { SalaryComponentResponseDto } from "../dtos/reponses.dto";
import { toSalaryComponentResponseDto } from "../utils/responseHelpers";

export async function createSalaryComponentService(dto: CreateSalaryComponentDto, actorId: number, actor: string): Promise<ServiceResponse<SalaryComponentResponseDto>> {
    try {
        // ensure code uniqueness
        await ensureUnique(() => prisma.salaryComponent.findFirst({ where: { code: dto.code } }), "SalaryComponent");

        const created = await prisma.$transaction(async (tx) => {
            const sc = await tx.salaryComponent.create({
                data: {
                    code: dto.code,
                    name: dto.name,
                    description: dto.description ?? null,
                    componentType: dto.componentType,
                    taxable: dto.taxable ?? true,
                    employerPaid: dto.employerPaid ?? false,
                    defaultAmount: dto.defaultAmount ? dto.defaultAmount : undefined,
                    capAmount: dto.capAmount ? dto.capAmount : undefined,
                    glAccount: dto.glAccount ?? null,
                }
            });

            await createHistoryService(tx, actorId, actor, `Created salary component ${sc.code}`);
            return sc;
        });

        const payload = toSalaryComponentResponseDto(created);
        return { statusCode: 201, data: payload, message: "Salary component created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("SalaryComponent", "unique constraint");
        }
        throw err;
    }
}

export async function getSalaryComponentByIdService(id: number): Promise<ServiceResponse<SalaryComponentResponseDto>> {

    const sc = await ensureExists(() => prisma.salaryComponent.findUnique({ where: { id } }), "Salary component")
    const payload = toSalaryComponentResponseDto(sc);
    return { statusCode: 200, data: payload, message: "Salary component fetched." };
}

export async function getSalaryComponentsService(options?: { page?: number; limit?: number; search?: string; code?: string; componentType?: string; taxable?: string; employerPaid?: string; sortBy?: string; order?: string }): Promise<ServiceResponse<any>> {
    const { page = 1, limit = 10, search, code, componentType, taxable, employerPaid, sortBy = "id", order = "asc" } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ["id", "createdAt", "updatedAt", "code", "name"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const where: any = {};
    if (code && String(code).trim().length > 0) where.code = code;
    if (componentType && String(componentType).trim().length > 0) where.componentType = componentType;
    if (typeof taxable === "string" && taxable.trim().length > 0) where.taxable = taxable === "true";
    if (typeof employerPaid === "string" && employerPaid.trim().length > 0) where.employerPaid = employerPaid === "true";

    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [
            { name: { contains: q } },
            { description: { contains: q } },
            { code: { contains: q } },
        ];
    }

    const [total, rows] = await Promise.all([
        prisma.salaryComponent.count({ where }),
        prisma.salaryComponent.findMany({ where, orderBy: { [sortField]: sortOrder }, skip, take: safeLimit }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
    const mapped = rows.map((r) => toSalaryComponentResponseDto(r));

    const result = {
        salaryComponents: mapped,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
    };

    return { statusCode: 200, data: result, message: "Salary components fetched." };
}

export async function updateSalaryComponentService(id: number, dto: Partial<CreateSalaryComponentDto>, actorId: number, actor: string): Promise<ServiceResponse<SalaryComponentResponseDto>> {
    // ensure exists
    const existing = await ensureExists(() => prisma.salaryComponent.findUnique({ where: { id } }), 'SalaryComponent');

    const data: any = {};
    if (dto.code !== undefined && dto.code !== existing.code) {
        await ensureUnique(() => prisma.salaryComponent.findFirst({ where: { code: dto.code, NOT: { id } } }), 'SalaryComponent');
        data.code = dto.code;
    }
    if (dto.name !== undefined) data.name = dto.name ?? null;
    if (dto.description !== undefined) data.description = dto.description ?? null;
    if (dto.componentType !== undefined) data.componentType = dto.componentType ?? undefined;
    if (dto.taxable !== undefined) data.taxable = dto.taxable;
    if (dto.employerPaid !== undefined) data.employerPaid = dto.employerPaid;
    if (dto.defaultAmount !== undefined) data.defaultAmount = dto.defaultAmount ?? undefined;
    if (dto.capAmount !== undefined) data.capAmount = dto.capAmount ?? undefined;
    if (dto.glAccount !== undefined) data.glAccount = dto.glAccount ?? null;

    try {
        const updated = await prisma.$transaction(async (tx) => {
            const up = await tx.salaryComponent.update({ where: { id }, data });
            await createHistoryService(tx, actorId, actor, `Updated salary component ID=${id}`);
            return up;
        });

        const payload = toSalaryComponentResponseDto(updated);
        return { statusCode: 200, data: payload, message: 'Salary component updated.' };
    } catch (err: any) {
        if (err?.code === 'P2002') {
            throw new ConflictError('SalaryComponent', 'unique constraint');
        }
        throw err;
    }
}

export async function deleteSalaryComponentService(id: number, actorId: number, actor: string): Promise<ServiceResponse<void>> {
    await ensureExists(() => prisma.salaryComponent.findUnique({ where: { id } }), 'SalaryComponent');

    await prisma.$transaction(async (tx) => {
        await tx.salaryComponent.delete({ where: { id } });
        await createHistoryService(tx, actorId, actor, `Deleted salary component ID=${id}`);
    });

    return { statusCode: 200, message: 'Salary component deleted.' };
}


