import { Request, Response, NextFunction } from "express";
import { deletePayrollRun, getAllPayrollRun, getPayrollById } from "../services/payrollRun.service";
import { getIdAndActeur, getParamsId } from "../utils/helper";


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

