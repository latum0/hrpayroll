import { Request, Response, NextFunction } from "express";
import { getAllHistoriques, getHistoriqueById, deleteHistoriqueById, deleteOldHistoriques } from "../services/history.service";
import { getIdAndActeur, getParamsId } from "../utils/helper";

export async function getAllHistoriquesController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const filters = req.query;
    const { statusCode, data } = await getAllHistoriques(filters);
    res.status(statusCode).json(data);

}

export async function getHistoriqueByIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const id = getParamsId(req)
    const { statusCode, data } = await getHistoriqueById(id);
    res.status(statusCode).json(data);

}

export async function deleteHistoriqueByIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {


    const historyId = getParamsId(req)
    const { id, acteur } = getIdAndActeur(req);
    const { statusCode, message } = await deleteHistoriqueById(historyId, id, acteur);
    res.status(statusCode).json({ message });
}

export async function deleteOldHistoriquesController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const result = await deleteOldHistoriques();
    res.status(200).json({ deleted: result.count });

} 