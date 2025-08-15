// services/role.service.ts
import { ServiceResponse } from "../types/service";
import { CreateRoleDto, UpdateRoleDto, RoleListResponseDto, RoleResponseDto } from "../dtos/role.dto";
import { prisma } from "../config/database";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { ConflictError, BadRequestError, NotFoundError } from "../utils/errors";
import { ensureExists, ensureUnique, stripNullish } from "../utils/helper";
import { createHistoryService } from "./history.service";
import { Prisma } from "../../generated/prisma";
import { error } from "console";

/**
 * Create Role
 */
export async function createRoleService(
    dto: CreateRoleDto,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<RoleResponseDto>> {
    try {
        // ensure uniqueness of name first for nicer error
        await ensureUnique(() => prisma.role.findUnique({ where: { name: dto.name } }), "Role");

        const created = await prisma.$transaction(async (tx) => {
            const role = await tx.role.create({
                data: {
                    name: dto.name,
                    description: dto.description ?? null
                }
            });

            await createHistoryService(tx, acteurId, acteur, "Role create");

            return role;
        });

        return { statusCode: 201, data: created as RoleResponseDto, message: "Role created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Role", field as string);
        }
        throw err;
    }
}




export async function updateRoleService(
    roleId: number,
    dto: UpdateRoleDto,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<RoleResponseDto>> {
    try {
        await ensureExists(() => prisma.role.findUnique({ where: { id: roleId } }), "Role");

        const stripped = stripNullish(dto);

        const payload = stripped as Prisma.RoleUpdateInput;

        const updated = await prisma.$transaction(async (tx) => {
            const role = await tx.role.update({
                where: { id: roleId },
                data: payload,
            });

            await createHistoryService(tx, acteurId, acteur, "Role update");
            return role;
        });

        return { statusCode: 200, data: updated as RoleResponseDto, message: "Role updated." };
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Role", field as string);
        }
        throw err;
    }
}


export async function getRoleByIdService(roleId: number): Promise<ServiceResponse<RoleResponseDto>> {
    const role = await ensureExists(
        () => prisma.role.findUnique({ where: { id: roleId }, include: { _count: { select: { users: true } } } }),
        "Role"
    );

    return { statusCode: 200, data: role as RoleResponseDto, message: "Role fetched." };
}


export async function getRolesService(options?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
}): Promise<ServiceResponse<RoleListResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = "id", order = "asc" } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ["id", "name", "createdAt", "updatedAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const where: any = {};
    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
    }

    const [total, roles] = await Promise.all([
        prisma.role.count({ where }),
        prisma.role.findMany({
            where,
            include: { _count: { select: { users: true } } },
            orderBy: { [sortField]: sortOrder },
            skip,
            take: safeLimit
        })
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

    const result: RoleListResponseDto = {
        roles: roles as RoleResponseDto[],
        total,
        page: safePage,
        limit: safeLimit,
        totalPages
    };

    return { statusCode: 200, data: result, message: "Roles fetched." };
}

export async function deleteRoleService(roleId: number, acteurId: number, acteur: string): Promise<ServiceResponse<RoleResponseDto>> {
    try {
        await ensureExists(() => prisma.role.findUnique({ where: { id: roleId } }), "Role");

        const assignedCount = await prisma.users.count({ where: { roleId } });
        if (assignedCount > 0) {
            throw new BadRequestError("Cannot delete role with assigned users");
        }

        const deleted = await prisma.$transaction(async (tx) => {
            const role = await tx.role.delete({ where: { id: roleId } });
            await createHistoryService(tx, acteurId, acteur, "Role delete");
            return role;
        });

        return { statusCode: 200, data: deleted as RoleResponseDto, message: "Role deleted." };
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                throw new BadRequestError("Role not found");
            }
        }
        throw err;
    }
}
