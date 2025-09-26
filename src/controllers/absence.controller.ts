import { Request, Response, NextFunction } from "express";
import { createAbsenceService } from "../services/absence.service";
import { CreateAbsenceDto } from "../dtos/absence.dto";
import { getIdAndActeur } from "../utils/helper";
import { updateAbsenceService, deleteAbsenceService } from "../services/absence.service";
import { UpdateAbsenceDto } from "../dtos/absence.dto";
import { BadRequestError } from "../utils/errors";
import { getAbsenceByIdService, getAbsencesService } from "../services/absence.service";

export async function createAbsenceController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateAbsenceDto;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await createAbsenceService(dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function updateAbsenceController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new BadRequestError("Invalid absence id");

    const dto = req.body as UpdateAbsenceDto;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updateAbsenceService(id, dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function deleteAbsenceController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: actorId, acteur } = getIdAndActeur(req);
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new BadRequestError("Invalid absence id");

    const { statusCode, message } = await deleteAbsenceService(id, actorId, acteur);
    res.status(statusCode).json({ message });
}

export async function getAbsenceByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new BadRequestError("Invalid absence id");

    const { data, message, statusCode } = await getAbsenceByIdService(id);
    res.status(statusCode).json({ data, message });
}

export async function getAbsencesController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
    const payrollRunId = req.query.payrollRunId ? Number(req.query.payrollRunId) : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const order = typeof req.query.order === "string" && (req.query.order === "asc" || req.query.order === "desc") ? (req.query.order as "asc" | "desc") : undefined;

    if ((page !== undefined && (Number.isNaN(page) || page <= 0)) || (limit !== undefined && (Number.isNaN(limit) || limit <= 0))) {
        throw new BadRequestError("Invalid pagination parameters");
    }

    const opts: any = { page, limit, search, employeeId, payrollRunId, sortBy, order };
    const { data, message, statusCode } = await getAbsencesService(opts);
    res.status(statusCode).json({ data, message });
}
