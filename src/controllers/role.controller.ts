import { Request, Response, NextFunction } from "express";
import {
    createRoleService,
    updateRoleService,
    getRoleByIdService,
    getRolesService,
    deleteRoleService
} from "../services/role.service";
import { CreateRoleDto, UpdateRoleDto } from "../dtos/role.dto";
import { getIdAndActeur, getParamsId } from "../utils/helper";


export async function createRoleController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateRoleDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await createRoleService(dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}


export async function updateRoleController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const dto = req.body as UpdateRoleDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updateRoleService(id, dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}


export async function getRoleByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const { data, message, statusCode } = await getRoleByIdService(id);
    res.status(statusCode).json({ data, message });
}


export async function getRolesController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const order = typeof req.query.order === "string" && (req.query.order === "asc" || req.query.order === "desc") ? (req.query.order as "asc" | "desc") : undefined;

    if ((page !== undefined && (Number.isNaN(page) || page <= 0)) ||
        (limit !== undefined && (Number.isNaN(limit) || limit <= 0))) {
        throw new Error("Invalid pagination parameters");
    }

    const { data, message, statusCode } = await getRolesService({ page, limit, search, sortBy, order });
    res.status(statusCode).json({ data, message });
}


export async function deleteRoleController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await deleteRoleService(id, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}
