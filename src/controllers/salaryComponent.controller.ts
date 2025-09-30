import { Request, Response } from "express";
import { CreateSalaryComponentDto } from "../dtos/salaryComponent.dto";
import { createSalaryComponentService } from "../services/salaryComponent.service";
import { getIdAndActeur } from "../utils/helper";
import { getSalaryComponentByIdService, getSalaryComponentsService } from "../services/salaryComponent.service";
import { updateSalaryComponentService, deleteSalaryComponentService } from "../services/salaryComponent.service";
import { BadRequestError } from "../utils/errors";

export async function createSalaryComponentController(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateSalaryComponentDto;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { statusCode, data, message } = await createSalaryComponentService(dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function getSalaryComponentByIdController(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const { statusCode, data, message } = await getSalaryComponentByIdService(id);
    res.status(statusCode).json({ data, message });
}

export async function getSalaryComponentsController(req: Request, res: Response): Promise<void> {
    const options = {
        page: req.query.page as unknown as number,
        limit: req.query.limit as unknown as number,
        search: req.query.search as string,
        code: req.query.code as string,
        componentType: req.query.componentType as string,
        taxable: req.query.taxable as string,
        employerPaid: req.query.employerPaid as string,
        sortBy: req.query.sortBy as string,
        order: req.query.order as string,
    };

    const { statusCode, data, message } = await getSalaryComponentsService(options);
    res.status(statusCode).json({ data, message });
}

export async function updateSalaryComponentController(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new BadRequestError('Invalid salary component id');

    const dto = req.body as any;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { statusCode, data, message } = await updateSalaryComponentService(id, dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function deleteSalaryComponentController(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new BadRequestError('Invalid salary component id');

    const { id: actorId, acteur } = getIdAndActeur(req);
    const { statusCode, message } = await deleteSalaryComponentService(id, actorId, acteur);
    res.status(statusCode).json({ message });
}
