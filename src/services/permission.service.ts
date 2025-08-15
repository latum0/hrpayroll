// services/permission.service.ts
import { ServiceResponse } from "../types/service";
import {
    CreatePermissionDto,
    UpdatePermissionDto,
    PermissionListResponseDto,
    PermissionResponseDto,
} from "../dtos/permission.dto";
import { prisma } from "../config/database";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { ConflictError, BadRequestError } from "../utils/errors";
import { ensureExists, ensureUnique, stripNullish } from "../utils/helper";
import { createHistoryService } from "./history.service";
import { Prisma } from "../../generated/prisma";


export async function createPermissionService(
    dto: CreatePermissionDto,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<PermissionResponseDto>> {
    try {
        await ensureUnique(() => prisma.permission.findUnique({ where: { name: dto.name } }), "Permission");

        const created = await prisma.$transaction(async (tx) => {
            const permission = await tx.permission.create({
                data: {
                    name: dto.name,
                    description: dto.description ?? null,
                },
            });

            await createHistoryService(tx, acteurId, acteur, "Permission create");

            return permission;
        });

        return { statusCode: 201, data: created as PermissionResponseDto, message: "Permission created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Permission", field as string);
        }
        throw err;
    }
}


export async function updatePermissionService(
    permissionId: number,
    dto: UpdatePermissionDto,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<PermissionResponseDto>> {
    try {
        await ensureExists(() => prisma.permission.findUnique({ where: { id: permissionId } }), "Permission");

        const stripped = stripNullish(dto);
        // safe cast because DTO validation runs in route; stripNullish removes null/undefined
        const payload = stripped as Prisma.PermissionUpdateInput;

        const updated = await prisma.$transaction(async (tx) => {
            const permission = await tx.permission.update({
                where: { id: permissionId },
                data: payload,
            });

            await createHistoryService(tx, acteurId, acteur, "Permission update");

            return permission;
        });

        return { statusCode: 200, data: updated as PermissionResponseDto, message: "Permission updated." };
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Permission", field as string);
        }
        throw err;
    }
}


export async function getPermissionByIdService(permissionId: number): Promise<ServiceResponse<PermissionResponseDto>> {
    const permission = await ensureExists(
        () =>
            prisma.permission.findUnique({
                where: { id: permissionId },
                include: { _count: { select: { rolePermissions: true, userPermissions: true } } },
            }),
        "Permission"
    );

    return { statusCode: 200, data: permission as PermissionResponseDto, message: "Permission fetched." };
}


export async function getPermissionsService(options?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
}): Promise<ServiceResponse<PermissionListResponseDto>> {
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
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
        ];
    }

    const [total, permissions] = await Promise.all([
        prisma.permission.count({ where }),
        prisma.permission.findMany({
            where,
            include: { _count: { select: { rolePermissions: true, userPermissions: true } } },
            orderBy: { [sortField]: sortOrder },
            skip,
            take: safeLimit,
        }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

    const result: PermissionListResponseDto = {
        permissions: permissions as PermissionResponseDto[],
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
    };

    return { statusCode: 200, data: result, message: "Permissions fetched." };
}

export async function deletePermissionService(
    permissionId: number,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<PermissionResponseDto>> {
    try {
        await ensureExists(() => prisma.permission.findUnique({ where: { id: permissionId } }), "Permission");

        const roleAssignments = await prisma.rolePermission.count({ where: { permissionId } });
        const userAssignments = await prisma.userPermission.count({ where: { permissionId } });

        if (roleAssignments > 0 || userAssignments > 0) {
            throw new BadRequestError("Cannot delete permission: it is assigned to roles or users");
        }

        const deleted = await prisma.$transaction(async (tx) => {
            const permission = await tx.permission.delete({ where: { id: permissionId } });
            await createHistoryService(tx, acteurId, acteur, "Permission delete");
            return permission;
        });

        return { statusCode: 200, data: deleted as PermissionResponseDto, message: "Permission deleted." };
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                throw new BadRequestError("Permission not found");
            }
        }
        throw err;
    }
}
