import { NextFunction, Request, Response } from "express";
import { createNotification, createNotificationDepartment, createNotificationEmployee, deleteNotification, getNotificationByDepartment, getNotificationByEmployee, getNotificationById, getNotifications, updateStatusNotif } from "../services/notification.service";
import { CreateNotificationDepartmentDto, CreateNotificationDto, CreateNotificationEmployeeDto, UpdateNotificationStatusDto } from "../dtos/notification.dto";
import { getIdAndActeur, getParamsId } from "../utils/helper";
import { BadRequestError, ForbiddenError } from "../utils/errors";
import { NotificationStatus } from "../../generated/prisma";
import { getDepartmentByEmployee } from "../services/department.service";


export async function createNotificationController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateNotificationDto;
    const { id: acteurId, acteur } = getIdAndActeur(req)

    const { statusCode, data, message } = await createNotification(dto, acteurId, acteur)
    res.status(statusCode).json({ data, message });
}

export async function createNotificationEmployeeController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateNotificationEmployeeDto;
    const { id: acteurId, acteur } = getIdAndActeur(req)

    const { statusCode, data, message } = await createNotificationEmployee(dto, acteurId, acteur)
    res.status(statusCode).json({ data, message });
}

export async function createNotificationDepartmentController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateNotificationDepartmentDto;
    const { id: acteurId, acteur } = getIdAndActeur(req)

    const { statusCode, data, message } = await createNotificationDepartment(dto, acteurId, acteur)
    res.status(statusCode).json({ data, message });
}


export async function updateStatusNotificationsController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)
    const status = req.body as UpdateNotificationStatusDto;
    const { id: acteurId, acteur } = getIdAndActeur(req)
    const { statusCode, data } = await updateStatusNotif(id, status, acteurId, acteur)
    res.status(statusCode).json(data);
}

export async function getNotificationByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new BadRequestError("ID must be a number.")
    }
    const { statusCode, data } = await getNotificationById(id)
    res.status(statusCode).json(data);
}

export async function getNotificationByEmployeeController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = req.user?.id ?? req.user?.sub
    if (!id) {
        throw new ForbiddenError("You need to be logged in")
    }
    const { statusCode, data } = await getNotificationByEmployee(id)
    res.status(statusCode).json(data);
}

export async function getNotificationByDepartmentController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = req.user?.id ?? req.user?.sub
    if (!id) {
        throw new ForbiddenError("You need to be logged in")
    }

    const { statusCode, data } = await getNotificationByDepartment(id)
    res.status(statusCode).json(data);
}

export async function getNotificationsController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { statusCode, data } = await getNotifications()
    res.status(statusCode).json(data);
}

export async function getNotificationsDepartmentController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: acteurId } = getIdAndActeur(req)
    const dept = await getDepartmentByEmployee(acteurId)
    const deptId = dept.data?.id;
    if (!deptId) {
        throw new ForbiddenError("You don't have a department for now.")
    }

    const { statusCode, data } = await getNotifications(undefined, deptId)
    console.log("safe1")
    res.status(statusCode).json(data);
}

export async function getNotificationsEmployeeController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: acteurId } = getIdAndActeur(req)
    const { statusCode, data } = await getNotifications(acteurId)
    res.status(statusCode).json(data);
}

export async function deleteNotificationsController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)
    const { id: acteurId, acteur } = getIdAndActeur(req)
    const { statusCode, data, message } = await deleteNotification(id, acteurId, acteur)
    res.status(statusCode).json({ data, message });
}


