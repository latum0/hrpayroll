import { Request, Response, NextFunction } from "express";
import { createLeaveRequest, deleteLeaveRequest, getLeaveRequestByIdService, getLeaveRequestsService, updatesLeaveRequestService, updateStatusForManager } from "../services/leaveRequest.service";
import { CreateLeaveRequestDto, GetLeaveRequestsOptionsDto, LeaveRequestStatusDto, UpdateLeaveRequestDto } from "../dtos/leaveRequest.dto";
import { getIdAndActeur } from "../utils/helper";
import { BadRequestError } from "../utils/errors";

export async function createLeaveRequestController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateLeaveRequestDto;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await createLeaveRequest(dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}


export async function getLeaveRequestByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new BadRequestError("Invalid leave request id");

    const { data, message, statusCode } = await getLeaveRequestByIdService(id);
    res.status(statusCode).json({ data, message });
}

export async function getLeaveRequestsController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const order = typeof req.query.order === "string" && (req.query.order === "asc" || req.query.order === "desc") ? (req.query.order as "asc" | "desc") : undefined;

    if ((page !== undefined && (Number.isNaN(page) || page <= 0)) ||
        (limit !== undefined && (Number.isNaN(limit) || limit <= 0))) {
        throw new BadRequestError("Invalid pagination parameters");
    }

    const opts: GetLeaveRequestsOptionsDto = { page, limit, search, employeeId, departmentId, status, type, sortBy, order };
    const { data, message, statusCode } = await getLeaveRequestsService(opts);
    res.status(statusCode).json({ data, message });
}

export async function updateLeaveRequestController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new BadRequestError("Invalid leave request id");

    const dto = req.body as UpdateLeaveRequestDto;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updatesLeaveRequestService(id, dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function updateStatusLeaveRequestController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const leaveID = Number(req.params.id);
    if (Number.isNaN(leaveID) || leaveID <= 0) {
        throw new BadRequestError("Invalid leave request id")
    }
    const dto = req.body as LeaveRequestStatusDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { statusCode, data, message } = await updateStatusForManager(leaveID, dto, acteurId, acteur)
    res.status(statusCode).json({ data, message })
}



export async function deleteLeaveRequestController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: acteurId, acteur } = getIdAndActeur(req);
    const leaveId = Number(req.params.id);
    if (Number.isNaN(leaveId) || leaveId <= 0) {
        throw new BadRequestError("id isn't a number.")
    }

    const { statusCode, message } = await deleteLeaveRequest(leaveId, acteurId, acteur)

    res.status(statusCode).json({ message })
}