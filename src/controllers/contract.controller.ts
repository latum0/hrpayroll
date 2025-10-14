import { Request, Response, NextFunction } from "express";
import { CreateContractDto, UpdateContractDto } from "../dtos/contract.dto";
import { getIdAndActeur, getParamsId } from "../utils/helper";
import { createContractService, deleteContractService, updateContractService } from "../services/contract.service";
import { getContractByIdService, getContractsService } from "../services/contract.service";
import { BadRequestError } from "../utils/errors";

export async function createContractController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreateContractDto;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await createContractService(dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function deleteContractController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const { id: actorId, acteur } = getIdAndActeur(req);
    const { statusCode, message } = await deleteContractService(id, actorId, acteur);
    res.status(statusCode).json({ message });
}

export async function updateContractController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)
    const dto = req.body as any; // UpdateContractDto
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updateContractService(id, dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function getContractByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const { data, message, statusCode } = await getContractByIdService(id);
    res.status(statusCode).json({ data, message });
}

export async function getContractsController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { page, limit, search, employeeId, status, sortBy, order } = req.query as any;
    const options = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search,
        employeeId: employeeId ? Number(employeeId) : undefined,
        status,
        sortBy,
        order,
    };

    const { data, message, statusCode } = await getContractsService(options);
    res.status(statusCode).json({ data, message });
}
