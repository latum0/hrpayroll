import { Request, Response } from "express";
import { CreateBankAccountDto, UpdateBankAccountDto } from "../dtos/bankAccount.dto";
import { createBankAccountService } from "../services/bankAccount.service";
import { getBankAccountByIdService, getBankAccountsService } from "../services/bankAccount.service";
import { updateBankAccountService, deleteBankAccountService } from "../services/bankAccount.service";
import { getIdAndActeur } from "../utils/helper";
import { BadRequestError } from "../utils/errors";

export async function createBankAccountController(
    req: Request,
    res: Response
): Promise<void> {
    const dto = req.body as CreateBankAccountDto;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { statusCode, data, message } = await createBankAccountService(
        dto,
        actorId,
        acteur
    );

    res.status(statusCode).json({ data, message });
}

export async function getBankAccountByIdController(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new BadRequestError("Invalid bank account id");

    const { data, message, statusCode } = await getBankAccountByIdService(id);
    res.status(statusCode).json({ data, message });
}

export async function getBankAccountsController(req: Request, res: Response): Promise<void> {
    const { page, limit, search, employeeId, sortBy, order } = req.query as any;
    const options = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search,
        employeeId: employeeId ? Number(employeeId) : undefined,
        sortBy,
        order,
    };

    const { data, message, statusCode } = await getBankAccountsService(options);
    res.status(statusCode).json({ data, message });
}

export async function updateBankAccountController(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new Error('Invalid bank account id');

    const dto = req.body as UpdateBankAccountDto;
    const { id: actorId, acteur } = getIdAndActeur(req);

    const { data, message, statusCode } = await updateBankAccountService(id, dto, actorId, acteur);
    res.status(statusCode).json({ data, message });
}

export async function deleteBankAccountController(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) throw new Error('Invalid bank account id');

    const { id: actorId, acteur } = getIdAndActeur(req);
    const { statusCode, message } = await deleteBankAccountService(id, actorId, acteur);
    res.status(statusCode).json({ message });
}