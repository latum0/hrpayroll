import prisma from "../config/database";
import { CreateContractSalaryComponentDto } from "../dtos/contractSalary.dto";
import { ServiceResponse } from "../types/service";
import { ensureExists, ensureUnique } from "../utils/helper";
import { createHistoryService } from "./history.service";
import { ContractSalaryComponentResponseDto } from "../dtos/reponses.dto";
import { toContractSalaryComponentResponseDto } from "../utils/responseHelpers";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ConflictError } from "../utils/errors";

export async function createContractSalaryComponentService(dto: CreateContractSalaryComponentDto, actorId: number, actor: string): Promise<ServiceResponse<ContractSalaryComponentResponseDto>> {
    // ensure contract and salary component exist
    await ensureExists(() => prisma.employmentContract.findUnique({ where: { id: dto.contractId } }), "EmploymentContract");
    await ensureExists(() => prisma.salaryComponent.findUnique({ where: { id: dto.salaryComponentId } }), "SalaryComponent");

    // ensure we don't duplicate the same salaryComponent on the same contract
    await ensureUnique(() => prisma.contractSalaryComponent.findFirst({ where: { contractId: dto.contractId, salaryComponentId: dto.salaryComponentId } }), "Contract salary component link");

    try {
        const created = await prisma.$transaction(async (tx) => {
            const c = await tx.contractSalaryComponent.create({
                data: {
                    contractId: dto.contractId,
                    salaryComponentId: dto.salaryComponentId,
                    amount: dto.amount ? dto.amount : undefined,
                    active: dto.active !== undefined ? dto.active : true,
                }
            });

            await createHistoryService(tx, actorId, actor, `Added salary component ${dto.salaryComponentId} to contract ${dto.contractId}`);

            const withRelations = await tx.contractSalaryComponent.findUnique({ where: { id: c.id }, include: { contract: true, salaryComponent: true } });
            return withRelations;
        });

        if (!created) throw new Error("Failed to create contract salary component");

        const payload = toContractSalaryComponentResponseDto(created);
        return { statusCode: 201, data: payload, message: "Contract salary component created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("ContractSalaryComponent", "unique constraint");
        }
        throw err;
    }
}

export async function updateContractSalaryComponentService(id: number, dto: Partial<CreateContractSalaryComponentDto>, actorId: number, actor: string): Promise<ServiceResponse<ContractSalaryComponentResponseDto>> {
    const existing = await ensureExists(() => prisma.contractSalaryComponent.findUnique({ where: { id } }), 'ContractSalaryComponent');

    const data: any = {};
    if (dto.contractId !== undefined && dto.contractId !== existing.contractId) {
        await ensureExists(() => prisma.employmentContract.findUnique({ where: { id: dto.contractId } }), 'EmploymentContract');
        data.contractId = dto.contractId;
    }
    if (dto.salaryComponentId !== undefined && dto.salaryComponentId !== existing.salaryComponentId) {
        await ensureExists(() => prisma.salaryComponent.findUnique({ where: { id: dto.salaryComponentId } }), 'SalaryComponent');
        // ensure no duplicate for this contract
        const contractIdToCheck = data.contractId ?? existing.contractId;
        await ensureUnique(() => prisma.contractSalaryComponent.findFirst({ where: { contractId: contractIdToCheck, salaryComponentId: dto.salaryComponentId, NOT: { id } } }), 'Contract salary component link');
        data.salaryComponentId = dto.salaryComponentId;
    }

    if (dto.amount !== undefined) data.amount = dto.amount ?? undefined;
    if (dto.active !== undefined) data.active = dto.active;

    try {
        const updated = await prisma.$transaction(async (tx) => {
            const up = await tx.contractSalaryComponent.update({ where: { id }, data, include: { contract: true, salaryComponent: true } });
            await createHistoryService(tx, actorId, actor, `Updated contract salary component ID=${id}`);
            return up;
        });

        const payload = toContractSalaryComponentResponseDto(updated);
        return { statusCode: 200, data: payload, message: 'Contract salary component updated.' };
    } catch (err: any) {
        if (err?.code === 'P2002') {
            throw new ConflictError('ContractSalaryComponent', 'unique constraint');
        }
        throw err;
    }
}

export async function deleteContractSalaryComponentService(id: number, actorId: number, actor: string): Promise<ServiceResponse<void>> {
    await ensureExists(() => prisma.contractSalaryComponent.findUnique({ where: { id } }), 'ContractSalaryComponent');

    await prisma.$transaction(async (tx) => {
        await tx.contractSalaryComponent.delete({ where: { id } });
        await createHistoryService(tx, actorId, actor, `Deleted contract salary component ID=${id}`);
    });

    return { statusCode: 200, message: 'Contract salary component deleted.' };
}

export async function getContractSalaryComponentByIdService(id: number): Promise<ServiceResponse<ContractSalaryComponentResponseDto>> {
    const cs = await ensureExists(() => prisma.contractSalaryComponent.findUnique({ where: { id }, include: { contract: true, salaryComponent: true } }), 'ContractSalaryComponent');
    const payload = toContractSalaryComponentResponseDto(cs);
    return { statusCode: 200, data: payload, message: 'Contract salary component fetched.' };
}

export async function getContractSalaryComponentsService(options?: { page?: number; limit?: number; search?: string; contractId?: number; salaryComponentId?: number; active?: string; sortBy?: string; order?: string }): Promise<ServiceResponse<any>> {
    const { page = 1, limit = 10, search, contractId, salaryComponentId, active, sortBy = 'id', order = 'asc' } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ['id', 'createdAt', 'amount', 'active'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const where: any = {};
    if (typeof contractId === 'number') where.contractId = contractId;
    if (typeof salaryComponentId === 'number') where.salaryComponentId = salaryComponentId;
    if (typeof active === 'string' && active.trim().length > 0) where.active = active === 'true';

    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [
            { amount: { contains: q } },
            { salaryComponent: { name: { contains: q } } },
            { salaryComponent: { code: { contains: q } } },
        ];
    }

    const [total, rows] = await Promise.all([
        prisma.contractSalaryComponent.count({ where }),
        prisma.contractSalaryComponent.findMany({ where, include: { contract: true, salaryComponent: true }, orderBy: { [sortField]: sortOrder }, skip, take: safeLimit }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
    const mapped = rows.map((r) => toContractSalaryComponentResponseDto(r));

    const result = {
        contractSalaryComponents: mapped,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
    };

    return { statusCode: 200, data: result, message: 'Contract salary components fetched.' };
}
