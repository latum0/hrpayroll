import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "../config/database";
import { CreateLeaveRequestDto, LeaveRequestStatusDto, UpdateLeaveRequestDto } from "../dtos/leaveRequest.dto";
import { ServiceResponse } from "../types/service";
import { calculateLeaveDays, ensureExists, ensureUnique, startOfDayUTC, stripNullish, toLeaveRequestResponseDto } from "../utils/helper";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors";
import { createHistoryService } from "./history.service";
import { LeaveRequestResponseDto, LeaveRequestListResponseDto } from "../dtos/reponses.dto";
import { GetLeaveRequestsOptionsDto } from "../dtos/leaveRequest.dto";
import { LeaveRequestStatus } from "../../generated/prisma";


export async function createLeaveRequest(
    dto: CreateLeaveRequestDto,
    actorId: number,
    actor: string
): Promise<ServiceResponse<LeaveRequestResponseDto>> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    const startDay = startOfDayUTC(start);
    const endDay = startOfDayUTC(end);

    const msPerDay = 24 * 60 * 60 * 1000;
    const computedDays = Math.round((endDay.getTime() - startDay.getTime()) / msPerDay) + 1;
    const days = typeof dto.days === "number" && !Number.isNaN(dto.days) ? dto.days : computedDays;

    const employee = await ensureExists(() => prisma.employee.findUnique({ where: { id: dto.employeeId }, include: { user: true } }), "Employee");

    if (dto.departmentId !== undefined && dto.departmentId !== null) {
        await ensureExists(() => prisma.department.findUnique({ where: { id: dto.departmentId } }), "Department");
    }
    if (dto.payrollRunId !== undefined && dto.payrollRunId !== null) {
        await ensureExists(() => prisma.payrollRun.findUnique({ where: { id: dto.payrollRunId } }), "PayrollRun");
    }

    await ensureUnique(() => prisma.leaveRequest.findFirst({
        where: {
            employeeId: dto.employeeId,
            AND: [
                { startDate: { lte: end } },
                { endDate: { gte: start } }
            ]
        }
    }), "LeaveRequest")

    try {
        const created = await prisma.$transaction(async (tx) => {
            const lr = await tx.leaveRequest.create({
                data: {
                    employeeId: dto.employeeId,
                    departmentId: dto.departmentId ?? null,
                    startDate: start,
                    endDate: end,
                    type: dto.type as any,
                    days,
                    status: "PENDING",
                    reason: dto.reason ?? null,
                    payrollRunId: dto.payrollRunId ?? null,
                    payrollNote: dto.payrollNote ?? null
                }
            });

            await createHistoryService(tx, actorId, actor, `Created leave request #${lr.id} for employee ${employee.id}`);

            const withRelations = await tx.leaveRequest.findUnique({
                where: { id: lr.id },
                include: {
                    employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                    department: { select: { id: true, name: true } },
                    approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } }

                }
            });


            return withRelations;
        });

        const payload = toLeaveRequestResponseDto(created);

        return { statusCode: 201, data: payload, message: "Leave request created." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("Unique constraint violation while creating leave request");
        }
        throw err;
    }
}
export async function updatesLeaveRequestService(
    id: number,
    dto: UpdateLeaveRequestDto,
    actorId: number,
    actor: string
): Promise<ServiceResponse<LeaveRequestResponseDto>> {
    try {
        const existing = await ensureExists(
            () =>
                prisma.leaveRequest.findUnique({
                    where: { id },
                    include: {
                        employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                        department: { select: { id: true, name: true } }
                    }
                }),
            "Leave request"
        );


        const strp = stripNullish(dto)
        if (strp.startDate || strp.endDate) {
            const startDate = strp.startDate ? new Date(strp.startDate) : existing.startDate;
            const endDate = strp.endDate ? new Date(strp.endDate) : existing.endDate;

            if (startDate > endDate) {
                throw new BadRequestError("startDate must be before or equal to endDate");
            }
            if (strp.days === undefined) {
                strp.days = calculateLeaveDays(startDate, endDate);
            }
        }

        if (strp.departmentId) {
            await ensureExists(() => prisma.department.findUnique({ where: { id: strp.departmentId } }), "departmentId")
        }
        if (strp.payrollRunId) {
            const payrollRunId = Number(strp.payrollRunId)
            await ensureExists(() => prisma.payrollRun.findUnique({ where: { id: payrollRunId } }), "payrollRun")
        }
        if (strp.employeeId) {
            await ensureExists(() => prisma.employee.findUnique({ where: { id: strp.employeeId } }), "Employee")
        }
        if (strp.usersId) {
            const payrollRunId = Number(strp.payrollRunId)
            await ensureExists(() => prisma.users.findUnique({ where: { id: payrollRunId } }), "users")
        }

        if (strp.status && (strp.status === LeaveRequestStatus.APPROVED || strp.status === LeaveRequestStatus.REJECTED)) {
            throw new UnauthorizedError("You can't update the status.")
        }


        const updated = await prisma.$transaction(async (tx) => {
            const lr = await tx.leaveRequest.update({
                where: { id },
                data: strp,
                include: {
                    employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                    department: { select: { id: true, name: true } },
                    approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
            });

            await createHistoryService(tx, actorId, actor, `Leave request updated (ID ${id})`);
            return lr;
        });

        const payload = toLeaveRequestResponseDto(updated);

        return { statusCode: 200, data: payload, message: "Leave request updated." };
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === "P2025") throw new NotFoundError("Leave request");
            if (err.code === "P2003") throw new BadRequestError("Invalid foreign key reference");
            if (err.code === "P2002") throw new ConflictError("Unique constraint violation");
        }
        throw err;
    }
}

export async function updateStatusForManager(id: number, dto: LeaveRequestStatusDto, acteurId: number, acteur: string): Promise<ServiceResponse<LeaveRequestResponseDto>> {
    const leave = await ensureExists(() => prisma.leaveRequest.findUnique({ where: { id } }), "LeaveRequest")
    const result = await prisma.$transaction(async (tx) => {

        if (dto.status === leave.status) {
            throw new BadRequestError("The status cannot be updated because it is already set to this value.")
        }
        if (dto.status === LeaveRequestStatus.CANCELLED) {
            throw new BadRequestError("Only the employee can cancel")
        }
        if (leave.status === LeaveRequestStatus.APPROVED && dto.status !== LeaveRequestStatus.APPROVED) {
            await tx.leaveRequest.update({ where: { id }, data: { status: dto.status, approvedBy: { disconnect: true }, approvedAt: null } })
        } else if (dto.status === LeaveRequestStatus.APPROVED) {
            await tx.leaveRequest.update({ where: { id }, data: { status: dto.status, approvedBy: { connect: { id: acteurId } }, approvedAt: new Date() } })
        } else {
            await tx.leaveRequest.update({ where: { id }, data: { status: dto.status } })
        }

        await createHistoryService(tx, acteurId, acteur, `Updated leave request with the ID ${id}`)
        const updated = await tx.leaveRequest.findUnique({
            where: { id }, include: {
                employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                department: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
        })
        return updated
    })

    const payload = toLeaveRequestResponseDto(result);
    return { statusCode: 200, data: payload, message: "Leave request updated." }

}

export async function getLeaveRequestByIdService(id: number): Promise<ServiceResponse<LeaveRequestResponseDto>> {
    const lr = await ensureExists(
        () =>
            prisma.leaveRequest.findUnique({
                where: { id },
                include: {
                    employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                    department: { select: { id: true, name: true } },
                    approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                    // payrollRun: { select: { id: true } },
                },
            }),
        "LeaveRequest"
    );
    const payload = toLeaveRequestResponseDto(lr)

    return { statusCode: 200, data: payload, message: "Leave request fetched." };
}

export async function getLeaveRequestsService(options?: GetLeaveRequestsOptionsDto): Promise<ServiceResponse<LeaveRequestListResponseDto>> {
    const {
        page = 1,
        limit = 10,
        search,
        employeeId,
        departmentId,
        status,
        type,
        sortBy = "id",
        order = "asc",
    } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ["id", "startDate", "endDate", "createdAt", "status"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const where: any = {};

    if (typeof employeeId === "number") where.employeeId = employeeId;
    if (typeof departmentId === "number") where.departmentId = departmentId;
    if (typeof status === "string" && status.trim().length > 0) where.status = status;
    if (typeof type === "string" && type.trim().length > 0) where.type = type;

    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [
            { reason: { contains: q, mode: "insensitive" } },
            { payrollNote: { contains: q, mode: "insensitive" } },
            { employee: { user: { firstName: { contains: q, mode: "insensitive" } } } },
            { employee: { user: { lastName: { contains: q, mode: "insensitive" } } } },
            { employee: { user: { email: { contains: q, mode: "insensitive" } } } },
            { approvedBy: { firstName: { contains: q, mode: "insensitive" } } },
            { approvedBy: { lastName: { contains: q, mode: "insensitive" } } },
        ];
    }

    const [total, rows] = await Promise.all([
        prisma.leaveRequest.count({ where }),
        prisma.leaveRequest.findMany({
            where,
            include: {
                employee: { select: { id: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                department: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { [sortField]: sortOrder },
            skip,
            take: safeLimit,
        }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

    const mapped = rows.map((lr) => ({
        id: lr.id,
        employee: {
            id: lr.employee.id,
            firstName: lr.employee.user?.firstName ?? "",
            lastName: lr.employee.user?.lastName ?? null,
            email: lr.employee.user?.email ?? null,
        },
        department: lr.department ? { id: lr.department.id, name: lr.department.name } : null,
        startDate: lr.startDate.toISOString(),
        endDate: lr.endDate.toISOString(),
        type: lr.type,
        days: lr.days ?? null,
        status: lr.status,
        reason: lr.reason ?? null,
        payrollNote: lr.payrollNote ?? null,
        approvedBy: lr.approvedBy ? {
            id: lr.approvedBy.id,
            firstName: lr.approvedBy.firstName,
            lastName: lr.approvedBy.lastName ?? null,
            email: (lr.approvedBy as any).email ?? null,
        } : null,
        usersId: (lr as any).usersId ?? null,
        payrollRunId: lr.payrollRunId ?? null,
        createdAt: lr.createdAt.toISOString(),
        approvedAt: lr.approvedAt ? lr.approvedAt.toISOString() : null,
    })) as LeaveRequestResponseDto[];

    const result: LeaveRequestListResponseDto = {
        leaveRequests: mapped,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
    };

    return { statusCode: 200, data: result, message: "LeaveRequests fetched." };
}


export async function deleteLeaveRequest(id: number, acteurId: number, acteur: string): Promise<ServiceResponse<void>> {
    await ensureExists(() => prisma.leaveRequest.findUnique({ where: { id } }), "LeaveRequest")
    await prisma.$transaction(async (tx) => {
        await tx.leaveRequest.delete({ where: { id } })
        await createHistoryService(tx, acteurId, acteur, "Leave request deleted.");
    })

    return { statusCode: 200, message: "leaveRequest deleted." }

}



