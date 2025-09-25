import { NextFunction, Request, Response } from "express";
import { getIdAndActeur } from "../utils/helper";
import { CreateAttendanceDto, UpdateAttendanceDto } from "../dtos/attendance.dto";
import { createAttendance, deleteAttendance, getAttendanceById, getAttendancesService, updateAttendance } from "../services/attendance.service";
import { BadRequestError } from "../utils/errors";




export async function createAttendanceController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const { id: acteurId, acteur } = getIdAndActeur(req);
    const dto = req.body as CreateAttendanceDto
    const { statusCode, message, data } = await createAttendance(dto, acteurId, acteur)

    res.status(statusCode).json({ data, message })
}

export async function getAttendanceByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const attendanceId = Number(req.params.id);
    if (Number.isNaN(attendanceId) || attendanceId <= 0) throw new BadRequestError("Invalid department id");

    const { data, message, statusCode } = await getAttendanceById(attendanceId);
    res.status(statusCode).json({ data, message });

}


export async function updateAttendanceController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const attendanceId = Number(req.params.id);
    if (Number.isNaN(attendanceId) || attendanceId <= 0) throw new BadRequestError("Invalid department id");

    const dto = req.body as UpdateAttendanceDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updateAttendance(attendanceId, dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });

}


export async function deleteAttendanceController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const idAttendance = Number(req.params.id);
    if (Number.isNaN(idAttendance) || idAttendance <= 0) throw new BadRequestError("Invalid department id");
    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { statusCode, message, data } = await deleteAttendance(idAttendance, acteurId, acteur)

    res.status(statusCode).json({ data, message })
}


export async function getAttendancesController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;


    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const order = typeof req.query.order === "string" && (req.query.order === "asc" || req.query.order === "desc")
        ? (req.query.order as "asc" | "desc")
        : undefined;

    if ((page !== undefined && (Number.isNaN(page) || page <= 0)) ||
        (limit !== undefined && (Number.isNaN(limit) || limit <= 0))) {
        throw new BadRequestError("Invalid pagination parameters");
    }

    const { data, message, statusCode } = await getAttendancesService({
        page,
        limit,
        search,
        sortBy,
        order
    });

    res.status(statusCode).json({ data, message });
}