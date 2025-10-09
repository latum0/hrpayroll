import { Request, Response, NextFunction } from "express";
import { createPayrollRun, deletePayrollRun, getAllPayrollRun, getPayrollById, updatePayrollRun } from "../services/payrollRun.service";
import { getIdAndActeur, getParamsId } from "../utils/helper";
import { CreatePayrollRunDto, UpdatePayrollRunDto } from "../dtos/payrollRun.dto";


export async function createPayrollRunController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as CreatePayrollRunDto;
    const { id: acteurId, acteur } = getIdAndActeur(req)
    const { statusCode, data, message } = await createPayrollRun(dto, acteurId, acteur)
    res.status(statusCode).json({ data, message })
}

export async function getPayrollRunByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)
    const { statusCode, data } = await getPayrollById(id)
    res.status(statusCode).json(data)
}

export async function getAllPayrollRunController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { statusCode, data } = await getAllPayrollRun()
    res.status(statusCode).json(data)
}

export async function deletePayrollRunByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = getParamsId(req)
    const { id: acteurId, acteur } = getIdAndActeur(req)
    const { statusCode, message } = await deletePayrollRun(id, acteurId, acteur)
    res.status(statusCode).json({ message })
}

export async function updatePayrollRunController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as UpdatePayrollRunDto;
    const id = getParamsId(req)
    const { id: acteurId, acteur } = getIdAndActeur(req)
    const { statusCode, data, message } = await updatePayrollRun(dto, id, acteurId, acteur)
    res.status(statusCode).json({ data, message })
}