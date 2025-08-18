import { Request, Response, NextFunction } from "express";
import {
    createEmployeeService,
    updateEmployeeService,
    getEmployeeByIdService,
    getEmployeesService,
    deleteEmployeeService
} from "../services/employee.service";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos/employee.dto";
import { getIdAndActeur } from "../utils/helper";
import { BadRequestError } from "../utils/errors";

export async function createEmployeeController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateEmployeeDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await createEmployeeService(dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function updateEmployeeController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const employeeId = Number(req.params.id);
    if (Number.isNaN(employeeId) || employeeId <= 0) throw new BadRequestError("Invalid employee id");

    const dto = req.body as UpdateEmployeeDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updateEmployeeService(employeeId, dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function getEmployeeByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const employeeId = Number(req.params.id);
    if (Number.isNaN(employeeId) || employeeId <= 0) throw new BadRequestError("Invalid employee id");

    const { data, message, statusCode } = await getEmployeeByIdService(employeeId);
    res.status(statusCode).json({ data, message });
}

export async function getEmployeesController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
    const managerId = req.query.managerId ? Number(req.query.managerId) : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const order = typeof req.query.order === "string" && (req.query.order === "asc" || req.query.order === "desc") ? (req.query.order as "asc" | "desc") : undefined;

    if ((page !== undefined && (Number.isNaN(page) || page <= 0)) ||
        (limit !== undefined && (Number.isNaN(limit) || limit <= 0))) {
        throw new BadRequestError("Invalid pagination parameters");
    }

    const { data, message, statusCode } = await getEmployeesService({ page, limit, search, departmentId, managerId, sortBy, order });
    res.status(statusCode).json({ data, message });
}

export async function deleteEmployeeController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const employeeId = Number(req.params.id);
    if (Number.isNaN(employeeId) || employeeId <= 0) throw new BadRequestError("Invalid employee id");

    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await deleteEmployeeService(employeeId, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}
