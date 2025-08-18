import { ServiceResponse } from "../types/service";
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentListResponseDto, DepartmentResponseDto } from "../dtos/department.dto";
import { prisma } from "../config/database";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { ConflictError, BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors";
import { ensureExists, ensureUnique, stripNullish } from "../utils/helper";
import { createHistoryService } from "./history.service";
import { Prisma } from "../../generated/prisma";




export async function createDepartmentService(
    dto: CreateDepartmentDto,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<DepartmentResponseDto>> {
    try {

        await ensureUnique(() => prisma.department.findFirst({ where: { name: dto.name } }), "Department");

        const created = await prisma.$transaction(async (tx) => {
            const dept = await tx.department.create({
                data: {
                    name: dto.name,
                    description: dto.description ?? null
                }
            });

            await createHistoryService(tx, acteurId, acteur, `Department create (${dept.name})`);
            return dept;
        });

        const deptWithCounts = await prisma.department.findUnique({
            where: { id: created.id },
            include: { _count: { select: { employees: true, LeaveRequest: true } } }
        });

        return { statusCode: 201, data: deptWithCounts as DepartmentResponseDto, message: "Department created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Department", field as string);
        }
        throw err;
    }
}


export async function updateDepartmentService(
    departmentId: number,
    dto: UpdateDepartmentDto,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<DepartmentResponseDto>> {
    try {
        await ensureExists(() => prisma.department.findUnique({ where: { id: departmentId } }), "Department");


        const stripped = stripNullish(dto);
        const payload = stripped as Prisma.DepartmentUpdateInput;

        if ((payload as any).name) {
            const newName = String((payload as any).name).trim();
            if (newName.length > 0) {
                await ensureUnique(() => prisma.department.findFirst({ where: { name: newName, NOT: { id: departmentId } } }), "Department");
            }
        }

        const updated = await prisma.$transaction(async (tx) => {
            const dept = await tx.department.update({
                where: { id: departmentId },
                data: payload
            });

            await createHistoryService(tx, acteurId, acteur, `Department update (${dept.name})`);
            return dept;
        });

        const deptWithCounts = await prisma.department.findUnique({
            where: { id: updated.id },
            include: { _count: { select: { employees: true, LeaveRequest: true } } }
        });

        return { statusCode: 200, data: deptWithCounts as DepartmentResponseDto, message: "Department updated." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Department", field as string);
        }
        throw err;
    }
}


export async function getDepartmentByIdService(departmentId: number): Promise<ServiceResponse<DepartmentResponseDto>> {
    const dept = await ensureExists(
        () =>
            prisma.department.findUnique({
                where: { id: departmentId },
                include: { _count: { select: { employees: true, LeaveRequest: true } } }
            }),
        "Department"
    );

    return { statusCode: 200, data: dept as DepartmentResponseDto, message: "Department fetched." };
}


export async function getDepartmentsService(options?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
}): Promise<ServiceResponse<DepartmentListResponseDto>> {
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

    const [total, departments] = await Promise.all([
        prisma.department.count({ where }),
        prisma.department.findMany({
            where,
            include: { _count: { select: { employees: true, LeaveRequest: true } } },
            orderBy: { [sortField]: sortOrder },
            skip,
            take: safeLimit
        })
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

    const result: DepartmentListResponseDto = {
        departments: departments as DepartmentResponseDto[],
        total,
        page: safePage,
        limit: safeLimit,
        totalPages
    };

    return { statusCode: 200, data: result, message: "Departments fetched." };
}


export async function deleteDepartmentService(departmentId: number, acteurId: number, acteur: string): Promise<ServiceResponse<DepartmentResponseDto>> {
    try {
        const dept = await ensureExists(() => prisma.department.findUnique({ where: { id: departmentId } }), "Department");


        // check if department has employees
        const counts = await prisma.department.findUnique({
            where: { id: departmentId },
            include: { _count: { select: { employees: true, LeaveRequest: true } } }
        });

        if (counts && (counts._count?.employees ?? 0) > 0) {
            throw new BadRequestError("Department has assigned employees. Reassign or remove them before deleting the department.");
        }

        const deleted = await prisma.$transaction(async (tx) => {
            const d = await tx.department.delete({ where: { id: departmentId } });
            await createHistoryService(tx, acteurId, acteur, `Department delete (${d.name})`);
            return d;
        });

        return { statusCode: 200, data: deleted as DepartmentResponseDto, message: "Department deleted." };
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                throw new BadRequestError("Department not found");
            }
        }
        throw err;
    }
}
