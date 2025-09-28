import { ServiceResponse } from "../types/service";
import {
    CreateEmployeeDto,
    UpdateEmployeeDto
} from "../dtos/employee.dto";
import { prisma } from "../config/database";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { ConflictError, BadRequestError } from "../utils/errors";
import { ensureExists, ensureUnique, stripNullish } from "../utils/helper";
import { createHistoryService } from "./history.service";
import { Department, Employee, Prisma } from "../../generated/prisma";
import { EmployeeListResponseDto, EmployeeResponseDto } from "../dtos/reponses.dto";





export async function createEmployeeService(
    dto: CreateEmployeeDto,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<EmployeeResponseDto>> {
    try {


        await ensureExists(() => prisma.users.findUnique({ where: { id: dto.userId } }), "User");

        await ensureUnique(() => prisma.employee.findUnique({ where: { id: dto.userId } }), "Employee")

        await ensureExists(() => prisma.department.findUnique({ where: { id: dto.departmentId } }), "Department");

        if (dto.managerId) {
            await ensureExists(() => prisma.employee.findUnique({ where: { id: dto.managerId } }), "Manager")
        }

        const created = await prisma.$transaction(async (tx) => {
            const e = await tx.employee.create({
                data: {
                    id: dto.userId,
                    departmentId: dto.departmentId,
                    dob: dto.dob ? new Date(dto.dob) : undefined,
                    nationalId: dto.nationalId ?? null,
                    taxId: dto.taxId ?? null,
                    jobTitle: dto.jobTitle ?? null,
                    hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
                    terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
                    managerId: dto.managerId ?? null,
                }
            });

            await createHistoryService(tx, acteurId, acteur, `Employee create (userId=${dto.userId})`);
            return e;
        });

        const employeeWithRelations = await prisma.employee.findUnique({
            where: { id: created.id },
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
                department: { select: { id: true, name: true } },
                _count: { select: { bankAccounts: true, contracts: true, payslips: true, leaveRequests: true, attendance: true } }
            }
        });

        return { statusCode: 201, data: employeeWithRelations as EmployeeResponseDto, message: "Employee created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Employee", field as string);
        }
        throw err;
    }
}


export async function updateEmployeeService(
    employeeId: number,
    dto: UpdateEmployeeDto,
    acteurId: number,
    acteur: string
): Promise<ServiceResponse<EmployeeResponseDto>> {
    try {
        await ensureExists(() => prisma.employee.findUnique({ where: { id: employeeId } }), "Employee");

        if ((dto as any).departmentId) {
            await ensureExists(() => prisma.department.findUnique({ where: { id: (dto as any).departmentId } }), "Department");
        }

        if ((dto as any).managerId) {
            if ((dto as any).managerId === employeeId) throw new BadRequestError("Employee cannot be their own manager");
            await ensureExists(() => prisma.employee.findUnique({ where: { id: (dto as any).managerId } }), "Manager");
        }

        const stripped = stripNullish(dto) as any;

        if (stripped.dob) stripped.dob = new Date(stripped.dob);
        if (stripped.hireDate) stripped.hireDate = new Date(stripped.hireDate);
        if (stripped.terminationDate) stripped.terminationDate = new Date(stripped.terminationDate);

        const updated = await prisma.$transaction(async (tx) => {
            const e = await tx.employee.update({
                where: { id: employeeId },
                data: stripped as Prisma.EmployeeUpdateInput,
            });

            await createHistoryService(tx, acteurId, acteur, `Employee update (ID=${employeeId})`);
            return e;
        });

        const employeeWithRelations = await prisma.employee.findUnique({
            where: { id: updated.id },
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
                department: { select: { id: true, name: true } },
                _count: { select: { bankAccounts: true, contracts: true, payslips: true, leaveRequests: true, attendance: true } }
            }
        });

        return { statusCode: 200, data: employeeWithRelations as EmployeeResponseDto, message: "Employee updated." };
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Employee", field as string);
        }
        throw err;
    }
}


export async function getEmployeeByIdService(employeeId: number): Promise<ServiceResponse<EmployeeResponseDto>> {
    const employee = await ensureExists(
        () =>
            prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
                    department: { select: { id: true, name: true } },
                    manager: { select: { id: true } },
                    _count: { select: { bankAccounts: true, contracts: true, payslips: true, leaveRequests: true, attendance: true } }
                }
            }),
        "Employee"
    );

    return { statusCode: 200, data: employee as EmployeeResponseDto, message: "Employee fetched." };
}


export async function getEmployeesService(options?: {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: number;
    managerId?: number;
    sortBy?: string;
    order?: "asc" | "desc";
}): Promise<ServiceResponse<EmployeeListResponseDto>> {
    const { page = 1, limit = 10, search, departmentId, managerId, sortBy = "id", order = "asc" } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ["id", "jobTitle", "hireDate", "createdAt", "updatedAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const where: any = {};
    if (typeof departmentId === "number") where.departmentId = departmentId;
    if (typeof managerId === "number") where.managerId = managerId;

    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [
            { jobTitle: { contains: q } },
            { user: { firstName: { contains: q } } },
            { user: { lastName: { contains: q } } },
            { user: { email: { contains: q } } },
            { user: { phone: { contains: q } } }
        ];
    }

    const [total, employees] = await Promise.all([
        prisma.employee.count({ where }),
        prisma.employee.findMany({
            where,
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
                department: { select: { id: true, name: true } },
                manager: { select: { id: true } },
                _count: { select: { bankAccounts: true, contracts: true, payslips: true } }
            },
            orderBy: { [sortField]: sortOrder },
            skip,
            take: safeLimit
        })
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

    const result: EmployeeListResponseDto = {
        employees: employees as EmployeeResponseDto[],
        total,
        page: safePage,
        limit: safeLimit,
        totalPages
    };

    return { statusCode: 200, data: result, message: "Employees fetched." };
}


export async function deleteEmployeeService(employeeId: number, acteurId: number, acteur: string): Promise<ServiceResponse<EmployeeResponseDto>> {
    try {
        await ensureExists(() => prisma.employee.findUnique({ where: { id: employeeId } }), "Employee");


        const counts = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                _count: {
                    select: {
                        bankAccounts: true,
                        contracts: true,
                        payslips: true,
                        leaveRequests: true,
                        attendance: true,
                        PaymentBatchEntry: true,
                        Document: true,
                        Notification: true
                    }
                }
            }
        });


        const deleted = await prisma.$transaction(async (tx) => {
            const e = await tx.employee.delete({ where: { id: employeeId } });
            await createHistoryService(tx, acteurId, acteur, `Employee delete (ID=${employeeId})`);
            return e;
        });

        const response = await prisma.employee.findUnique({
            where: { id: deleted.id },
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
                department: { select: { id: true, name: true } },
                _count: { select: { bankAccounts: true, contracts: true, payslips: true } }
            }
        });

        return { statusCode: 200, data: response as EmployeeResponseDto, message: "Employee deleted." };
    } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                throw new BadRequestError("Employee not found");
            }
        }
        throw err;
    }
}


export async function getEmployeesPerDep(depID: number): Promise<ServiceResponse<Department>> {
    const department = await ensureExists(() => prisma.department.findUnique({
        where: { id: depID }, include: { employees: true }
    }
    ), "Department");

    return { statusCode: 200, data: department }
}

