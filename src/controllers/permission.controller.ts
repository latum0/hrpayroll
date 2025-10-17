// controllers/permission.controller.ts
import { Request, Response, NextFunction } from "express";
import {
    createPermissionService,
    updatePermissionService,
    getPermissionByIdService,
    getPermissionsService,
    deletePermissionService,
} from "../services/permission.service";
import { CreatePermissionDto, UpdatePermissionDto } from "../dtos/permission.dto";
import { getIdAndActeur, getParamsId } from "../utils/helper";


export async function createPermissionController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreatePermissionDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await createPermissionService(dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function updatePermissionController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const dto = req.body as UpdatePermissionDto;
    const { id: acteurId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updatePermissionService(id, dto, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}


export async function getPermissionByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const { data, message, statusCode } = await getPermissionByIdService(id);
    res.status(statusCode).json({ data, message });
}


export async function getPermissionsController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const order =
        typeof req.query.order === "string" && (req.query.order === "asc" || req.query.order === "desc")
            ? (req.query.order as "asc" | "desc")
            : undefined;

    if ((page !== undefined && (Number.isNaN(page) || page <= 0)) || (limit !== undefined && (Number.isNaN(limit) || limit <= 0))) {
        throw new Error("Invalid pagination parameters");
    }

    const { data, message, statusCode } = await getPermissionsService({ page, limit, search, sortBy, order });
    res.status(statusCode).json({ data, message });
}


export async function deletePermissionController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const { id: acteurId, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await deletePermissionService(id, acteurId, acteur);
    res.status(statusCode).json({ data, message });
}
