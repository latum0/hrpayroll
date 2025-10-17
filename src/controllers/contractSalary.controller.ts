import { Request, Response, NextFunction } from "express";
import { getIdAndActeur, getParamsId } from "../utils/helper";
import { createContractSalaryComponentService } from "../services/contractSalary.service";
import { getContractSalaryComponentByIdService, getContractSalaryComponentsService } from "../services/contractSalary.service";
import { updateContractSalaryComponentService, deleteContractSalaryComponentService } from "../services/contractSalary.service";
import { BadRequestError } from "../utils/errors";

export async function createContractSalaryComponentController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as any; // CreateContractSalaryComponentDto
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await createContractSalaryComponentService(dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function getContractSalaryComponentByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)
    const { statusCode, data, message } = await getContractSalaryComponentByIdService(id);
    res.status(statusCode).json({ data, message });
}

export async function getContractSalaryComponentsController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { page, limit, search, contractId, salaryComponentId, active, sortBy, order } = req.query as any;
    const options = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search,
        contractId: contractId ? Number(contractId) : undefined,
        salaryComponentId: salaryComponentId ? Number(salaryComponentId) : undefined,
        active,
        sortBy,
        order,
    };

    const { statusCode, data, message } = await getContractSalaryComponentsService(options);
    res.status(statusCode).json({ data, message });
}

export async function updateContractSalaryComponentController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const dto = req.body as any;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { statusCode, data, message } = await updateContractSalaryComponentService(id, dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function deleteContractSalaryComponentController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)

    const { id: actorId, acteur } = getIdAndActeur(req);
    const { statusCode, message } = await deleteContractSalaryComponentService(id, actorId, acteur);
    res.status(statusCode).json({ message });
}
