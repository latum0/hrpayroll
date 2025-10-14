import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";
import { getPayrollById } from "../services/payrollRun.service";


export async function getPayrollRunByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
        throw new BadRequestError("The id must be a valid.")
    }

    const { statusCode, data } = await getPayrollById(id)
    res.status(statusCode).json(data)

}