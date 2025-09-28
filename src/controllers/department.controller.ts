import { Request, Response, NextFunction } from "express";
import {
    createDepartmentService,
    updateDepartmentService,
    getDepartmentByIdService,
    getDepartmentsService,
    deleteDepartmentService,
    getDepartmentByEmployee
} from "../services/department.service";
import { CreateDepartmentDto, UpdateDepartmentDto } from "../dtos/department.dto";
import { getIdAndActeur } from "../utils/helper";
import { BadRequestError } from "../utils/errors";

export async function createDepartmentController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const dto = req.body as CreateDepartmentDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await createDepartmentService(dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });

}

export async function updateDepartmentController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const departmentId = Number(req.params.id);
    if (Number.isNaN(departmentId) || departmentId <= 0) throw new BadRequestError("Invalid department id");

    const dto = req.body as UpdateDepartmentDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updateDepartmentService(departmentId, dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });

}

export async function getDepartmentByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const departmentId = Number(req.params.id);
    if (Number.isNaN(departmentId) || departmentId <= 0) throw new BadRequestError("Invalid department id");

    const { data, message, statusCode } = await getDepartmentByIdService(departmentId);
    res.status(statusCode).json({ data, message });

}

export async function getEmployeesByDepartController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const { id: acteurId } = getIdAndActeur(req);
    const { statusCode, data } = await getDepartmentByEmployee(acteurId)
    res.status(statusCode).json(data);
}


export async function getDepartmentsController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const order = typeof req.query.order === "string" && (req.query.order === "asc" || req.query.order === "desc") ? (req.query.order as "asc" | "desc") : undefined;

    if ((page !== undefined && (Number.isNaN(page) || page <= 0)) ||
        (limit !== undefined && (Number.isNaN(limit) || limit <= 0))) {
        throw new BadRequestError("Invalid pagination parameters");
    }

    const { data, message, statusCode } = await getDepartmentsService({ page, limit, search, sortBy, order });
    res.status(statusCode).json({ data, message });

}

export async function deleteDepartmentController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const departmentId = Number(req.params.id);
    if (Number.isNaN(departmentId) || departmentId <= 0) throw new BadRequestError("Invalid department id");

    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await deleteDepartmentService(departmentId, acteurId, acteur);
    res.status(statusCode).json({ data, message });

}
