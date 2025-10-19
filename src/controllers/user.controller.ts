import { Request, Response, NextFunction } from "express";
import { CreateUserDto, UpdateOwnUserDto, UpdateUserDto } from "../dtos/user.dto";
import { createUserService, deleteUserService, getUserByIdService, getUsersService, updateUserService } from "../services/user.service";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors";
import { getIdAndActeur, getParamsId } from "../utils/helper";
export async function createUserController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const dto = req.body as CreateUserDto;
    const { id, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await createUserService(dto, id, acteur);
    res.status(statusCode).json({ data, message })
}

export async function updateUserController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const { id, acteur } = getIdAndActeur(req);


    const userId = getParamsId(req)
    const dto = req.body as UpdateUserDto;
    const { data, message, statusCode } = await updateUserService(userId, dto, id, acteur);
    res.status(statusCode).json({ data, message });
}


export async function getUserByIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const userId = getParamsId(req)

    const { data, message, statusCode } = await getUserByIdService(userId);
    res.status(statusCode).json({ data, message });
}
export async function getUsersController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const roleId = req.query.roleId ? Number(req.query.roleId) : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const order = typeof req.query.order === "string" && (req.query.order === "asc" || req.query.order === "desc")
        ? (req.query.order as "asc" | "desc")
        : undefined;

    if ((page !== undefined && (Number.isNaN(page) || page <= 0)) ||
        (limit !== undefined && (Number.isNaN(limit) || limit <= 0)) ||
        (roleId !== undefined && (Number.isNaN(roleId) || roleId <= 0))) {
        throw new BadRequestError("Invalid pagination or filter parameters");
    }

    const { data, message, statusCode } = await getUsersService({
        page,
        limit,
        search,
        roleId,
        sortBy,
        order,
    });

    res.status(statusCode).json({ data, message });
}



export async function deleteUserController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const userId = getParamsId(req)
    const { id, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await deleteUserService(userId, id, acteur);
    res.status(statusCode).json({ data, message });
}




export async function updateOwnProfileController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const currentUser = (req as any).user;
    if (!currentUser || !currentUser.id) {
        throw new Error("Not authenticated");
    }

    const dto = req.body as UpdateOwnUserDto;
    delete (dto as any).roleId;
    delete (dto as any).email;
    delete (dto as any).refreshToken;
    delete (dto as any).password;
    const { id, acteur } = getIdAndActeur(req);
    const { data, message, statusCode } = await updateUserService(currentUser.id, dto, id, acteur);
    res.status(statusCode).json({ data, message });
}