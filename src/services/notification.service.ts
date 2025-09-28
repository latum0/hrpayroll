import { error } from "console";
import { Employee, NotificationStatus } from "../../generated/prisma";
import prisma from "../config/database";
import { CreateNotificationDepartmentDto, CreateNotificationDto, CreateNotificationEmployeeDto, UpdateNotificationStatusDto } from "../dtos/notification.dto";
import { NotificationResponseDto } from "../dtos/reponses.dto";
import { ServiceResponse } from "../types/service";
import { ensureExists } from "../utils/helper";
import { toNotificationResponseDto } from "../utils/responseHelpers";
import { createHistoryService } from "./history.service";
import { BadRequestError } from "../utils/errors";



export async function createNotification(dto: CreateNotificationDto, userId: number, user: string): Promise<ServiceResponse<NotificationResponseDto>> {

    const result = await prisma.$transaction(async (tx) => {
        const notif = await tx.notification.create({
            data: {
                userId,
                type: dto.type,
                payload: (dto.payload ?? null),
                payslipId: (dto.payslipId ?? null)

            }
        })
        await createHistoryService(tx, userId, user, `Creation of a notification (with the ID ${notif.id})`)
        const response = await tx.notification.findUnique({
            where: { id: notif.id }, include: {
                Employee: { include: { user: { select: { id: true, email: true } } } },
                Department: { select: { id: true, name: true } }

            }
        })
        return response;

    })

    const payload: NotificationResponseDto = toNotificationResponseDto(result);

    return { statusCode: 201, data: payload, message: "notification created." }

}

export async function createNotificationEmployee(dto: CreateNotificationEmployeeDto, userId: number, user: string): Promise<ServiceResponse<NotificationResponseDto>> {

    if (dto.payslipId != undefined) {
        const payId = Number(dto.payslipId)
        await ensureExists(() => prisma.payslip.findUnique({ where: { id: payId } }), "Payslip")
    }

    const empId = Number(dto.employeeId)
    await ensureExists(() => prisma.employee.findUnique({ where: { id: empId } }), "Employee")



    const result = await prisma.$transaction(async (tx) => {
        const notif = await tx.notification.create({
            data: {
                userId,
                type: dto.type,
                payload: (dto.payload ?? null),
                payslipId: (dto.payslipId ?? null),
                employeeId: dto.employeeId

            }
        })
        await createHistoryService(tx, userId, user, `Creation of a notification (with the ID ${notif.id})`)
        const response = await tx.notification.findUnique({
            where: { id: notif.id }, include: {
                Employee: { include: { user: { select: { id: true, email: true } } } },
                Department: { select: { id: true, name: true } }

            }
        })
        return response;

    })

    const payload: NotificationResponseDto = toNotificationResponseDto(result);

    return { statusCode: 201, data: payload, message: "notification created." }

}


export async function createNotificationDepartment(dto: CreateNotificationDepartmentDto, userId: number, user: string): Promise<ServiceResponse<NotificationResponseDto>> {

    const depId = Number(dto.departmentId)
    await ensureExists(() => prisma.department.findUnique({ where: { id: depId } }), "Department")

    if (!dto.departmentId) {
        throw new BadRequestError("Department should exists.")
    }

    const result = await prisma.$transaction(async (tx) => {
        const notif = await tx.notification.create({
            data: {
                userId,
                type: dto.type,
                payload: (dto.payload ?? null),
                payslipId: (dto.payslipId ?? null),
                departmentId: dto.departmentId
            }
        })
        await createHistoryService(tx, userId, user, `Creation of a notification (with the ID ${notif.id})`)
        const response = await tx.notification.findUnique({
            where: { id: notif.id }, include: {
                Employee: { include: { user: { select: { id: true, email: true } } } },
                Department: { select: { id: true, name: true } }

            }
        })
        return response;

    })

    const payload: NotificationResponseDto = toNotificationResponseDto(result);

    return { statusCode: 201, data: payload, message: "notification created." }

}



export async function getNotificationById(id: number): Promise<ServiceResponse<NotificationResponseDto>> {
    const notif = await ensureExists(() => prisma.notification.findUnique({
        where: { id }, include: {
            Employee: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        }
                    }
                }
            },
            Department: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    }), "Notification");
    const payload: NotificationResponseDto = toNotificationResponseDto(notif);

    return { statusCode: 200, data: payload }
}

export async function getNotifications(userId?: number, depId?: number): Promise<ServiceResponse<NotificationResponseDto[]>> {

    const where: any = {}
    if (userId) {
        where.employeeId = userId
    }
    if (depId) {
        where.departmentId = depId
    }
    const [count, notifications] = await Promise.all([
        await prisma.notification.count(),
        await prisma.notification.findMany({
            where,
            include: {
                Employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            }
                        }
                    }
                },
                Department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
    ])
    const payload: any = notifications.map(n => toNotificationResponseDto(n))
    return { statusCode: 200, data: payload, message: `total: ${count}` }
}

export async function getNotificationByEmployee(id: number): Promise<ServiceResponse<NotificationResponseDto[]>> {
    await ensureExists(() => prisma.users.findUnique({
        where: { id }
    }), "User");

    const notifs = await prisma.notification.findMany({ where: { employeeId: id } })
    const payload: NotificationResponseDto[] = notifs.map(n => toNotificationResponseDto(n))
    return { statusCode: 200, data: payload }
}

export async function getNotificationByDepartment(id: number): Promise<ServiceResponse<NotificationResponseDto[]>> {
    await ensureExists(() => prisma.department.findUnique({
        where: { id }
    }), "Department");

    const notifs = await prisma.notification.findMany({ where: { departmentId: id } })
    const payload: NotificationResponseDto[] = notifs.map(n => toNotificationResponseDto(n))
    return { statusCode: 200, data: payload }
}

export async function updateStatusNotif(id: number, dto: UpdateNotificationStatusDto, userId: number, user: string): Promise<ServiceResponse<NotificationResponseDto>> {
    await ensureExists(() => prisma.notification.findUnique({ where: { id } }), "Notification")
    const status = dto.status
    const updated = await prisma.notification.update({
        where: { id }, data: { status }, include: {
            Employee: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true
                        }
                    }
                }
            },
            Department: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    return { statusCode: 200, data: updated, message: "Notification updated" }
}

export async function deleteNotification(id: number, userId: number, user: string): Promise<ServiceResponse<void>> {
    await ensureExists(() => prisma.notification.findUnique({ where: { id } }), "Notification")
    await prisma.$transaction(async (tx) => {
        await tx.notification.delete({ where: { id } })
        await createHistoryService(tx, userId, user, "Deleted a notification.")
    })

    return { statusCode: 200, message: "Notification deleted." }
}