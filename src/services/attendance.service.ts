import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "../config/database";
import { CreateAttendanceDto, UpdateAttendanceDto } from "../dtos/attendance.dto";
import { AttendanceListResponseDto, AttendanceResponseDto } from "../dtos/reponses.dto";
import { ServiceResponse } from "../types/service";
import { createPayloadAttendanceResponse, ensureExists, startOfDayUTC, stripNullish } from "../utils/helper";
import { ConflictError } from "../utils/errors";
import { createHistoryService } from "./history.service";
import { Options } from "../dtos/filter.dto";


export async function createAttendance(dto: CreateAttendanceDto, userId: number, actor: string): Promise<ServiceResponse<AttendanceResponseDto>> {
    const checkInDate = dto.checkIn ? new Date(dto.checkIn) : new Date();
    const day = startOfDayUTC(checkInDate);

    const employee = await ensureExists(() => prisma.users.findUnique({ where: { id: dto.employeeId } }), "Employee");
    if (dto.payrollRunId) {
        await ensureExists(() => prisma.payrollRun.findUnique({ where: { id: dto.payrollRunId } }), "PayrollRun");
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const attendance = await tx.attendance.create({
                data: {
                    employeeId: dto.employeeId,
                    checkIn: new Date(checkInDate),
                    day,
                    checkOut: new Date(dto.checkOut),
                    validatedById: userId,
                    note: dto.note ?? null,
                    payrollRunId: dto.payrollRunId ?? null,
                },
            });

            await createHistoryService(tx, userId, actor, `created attendance row for the ${employee.id}`)

            const payload = createPayloadAttendanceResponse(
                attendance.createdAt.toString(),
                attendance.checkIn.toString(),
                attendance.checkOut.toString(),
                employee.id,
                employee.firstName,
                userId,
                attendance.note,
                attendance.payrollRunId)

            return payload;

        })
        return { statusCode: 201, data: result as AttendanceResponseDto, message: "Attendance line created" }

    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Attendance", field as string);
        }
        throw err;
    }
}

export async function getAttendanceById(id: number): Promise<ServiceResponse<AttendanceResponseDto>> {
    const attendance = await ensureExists(() => prisma.attendance.findUnique({ where: { id } }), "Attendance")
    const employee = await ensureExists(() => prisma.users.findUnique({ where: { id: attendance.employeeId } }), "Employee")
    const payload = createPayloadAttendanceResponse(
        attendance.createdAt.toString(),
        attendance.checkIn.toString(),
        attendance.checkOut.toString(),
        employee.id,
        employee.firstName,
        attendance.validatedById,
        attendance.note,
        attendance.payrollRunId)

    return { statusCode: 200, data: payload }
}


export async function deleteAttendance(id: number, userId: number, actor: string): Promise<ServiceResponse<void>> {

    await ensureExists(() => prisma.attendance.findUnique({ where: { id } }), "Attendance")
    await prisma.$transaction(async (tx) => {
        await tx.attendance.delete({ where: { id } })
        await createHistoryService(tx, userId, actor, `deleted Attendance with the id ${id}`)
    })
    return { statusCode: 200, message: "Attendance deleted" }
}

export async function updateAttendance(id: number, dto: UpdateAttendanceDto, userId: number, actor: string): Promise<ServiceResponse<AttendanceResponseDto>> {
    const checkInDate = dto.checkIn ? new Date(dto.checkIn) : new Date();
    const day = startOfDayUTC(checkInDate);

    await ensureExists(() => prisma.attendance.findUnique({ where: { id } }), "Attendance");
    if (dto.employeeId != null) {
        await ensureExists(() => prisma.employee.findUnique({ where: { id: dto.employeeId } }), "Employee")
    }
    try {
        const strp = stripNullish(dto);
        const result = await prisma.$transaction(async (tx) => {
            const update = await tx.attendance.update({ where: { id }, data: { ...strp, day } })
            const employee = await tx.users.findUnique({ where: { id: update.employeeId } })
            await createHistoryService(tx, userId, actor, `Updated Attendance with the ID ${id}`)
            const payload = createPayloadAttendanceResponse(
                update.createdAt.toString(),
                update.checkIn.toString(),
                update.checkOut.toString(),
                update.employeeId,
                employee!.firstName,
                update.validatedById,
                update.note,
                update.payrollRunId

            )
            return payload
        })

        return { statusCode: 200, data: result as AttendanceResponseDto, message: "Attendance updated" }
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("Conflict Employee")
        }
        throw err
    }


}




export async function getAttendancesService(options?: Options): Promise<ServiceResponse<AttendanceListResponseDto>> {
    const {
        page = 1,
        limit = 10,
        search,
        sortBy = "id",
        order = "asc"
    } = options ?? {};

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = ["id", "checkIn", "checkOut", "createdAt", "day"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const where: any = {};


    if (search && String(search).trim().length > 0) {
        const q = String(search).trim();
        where.OR = [
            { note: { contains: q, mode: "insensitive" } },
            { employee: { user: { firstName: { contains: q, mode: "insensitive" } } } },
            { employee: { user: { lastName: { contains: q, mode: "insensitive" } } } },
            { employee: { user: { email: { contains: q, mode: "insensitive" } } } },
            { employee: { user: { phone: { contains: q, mode: "insensitive" } } } },
            { validatedBy: { firstName: { contains: q, mode: "insensitive" } } },
            { validatedBy: { lastName: { contains: q, mode: "insensitive" } } },
        ];
    }

    const [total, attendances] = await Promise.all([
        prisma.attendance.count({ where }),
        prisma.attendance.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        user: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
                validatedBy: {
                    select: { id: true, firstName: true, lastName: true },
                }
            },
            orderBy: { [sortField]: sortOrder },
            skip,
            take: safeLimit,
        }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

    const mapped = attendances.map((a) => {
        const att: AttendanceResponseDto = {
            createdAt: a.createdAt?.toISOString(),
            checkIn: a.checkIn.toISOString(),
            checkOut: a.checkOut ? a.checkOut.toISOString() : null as any,
            employee: {
                id: a.employee.id,
                firstName: a.employee.user?.firstName ?? "",
            },
            validatedById: a.validatedBy?.id ?? null as any,
            note: a.note ?? null,
        };
        return att;
    });

    const result: AttendanceListResponseDto = {
        attendances: mapped,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
    };

    return { statusCode: 200, data: result, message: "Attendances fetched." };
}