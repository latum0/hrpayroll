import { Prisma } from "../../generated/prisma";
import prisma from "../config/database";
import { CreateHistoriqueDto } from "../dtos/historique.dto";
import { ServiceResponse } from "../types/service";
import { ensureExists } from "../utils/helper";


export async function createHistoryService<T>(
    tx: Prisma.TransactionClient,
    userId: number,
    acteur: string,
    action: string
): Promise<void> {
    if (!acteur) {
        throw new Error("Acteur is required for history logging");
    }
    const payload: CreateHistoriqueDto = {
        userId,
        action,
        createdAt: new Date(),
        acteur
    }
    await tx.historique.create({ data: payload });
}



export async function getHistoriqueById(id: number) {
    const historique = await ensureExists(
        () => prisma.historique.findUnique({ where: { id: id } }),
        "Historique"
    );
    return { statusCode: 200, data: historique };
}
export async function getAllHistoriques(filters: any = {}) {
    const page = filters.page ? parseInt(filters.page as string, 10) : 1;
    const perPage = filters.perPage ? parseInt(filters.perPage as string, 10) : 25;
    const skip = (page - 1) * perPage;

    const where: any = {};

    if (filters.acteur) {
        where.acteur = { contains: filters.acteur };
    }

    if (filters.action) {
        where.action = { contains: filters.action };
    }

    if (filters.userId) {
        where.userId = Number(filters.userId);
    }

    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    try {
        const [total, historiques] = await Promise.all([
            prisma.historique.count({ where }),
            prisma.historique.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: "desc" },
                include: { user: true }, // optional: load user info
            }),
        ]);

        return {
            statusCode: 200,
            data: {
                data: historiques,
                meta: {
                    total,
                    page,
                    perPage,
                    totalPages: Math.ceil(total / perPage),
                },
            },
        };
    } catch (e) {
        console.error("Error in getAllHistoriques:", e);
        throw e;
    }
}


type DeleteOldResult = { count: number };
export async function deleteOldHistoriques(): Promise<DeleteOldResult> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await prisma.historique.deleteMany({
        where: {
            createdAt: {
                lt: oneWeekAgo,
            },
        },
    });
    return { count: result.count };
}


export async function deleteHistoriqueById(
    id: number,
    utilisateurId: number,
    acteur: string
): Promise<ServiceResponse<null>> {
    await ensureExists(
        () => prisma.historique.findUnique({ where: { id: id } }),
        "Historique"
    );

    await prisma.$transaction(async (tx) => {
        const deleted = await tx.historique.delete({
            where: { id: id },
        });

        await createHistoryService(
            tx,
            utilisateurId,
            acteur,
            `Suppression de l'historique ID=${deleted.id}`
        );
    });

    return {
        statusCode: 200,
        message: "Historique supprimé avec succès.",
    };
}

