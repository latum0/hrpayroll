import { Prisma } from "../../generated/prisma";
import { CreateHistoriqueDto } from "../dtos/historique.dto";
import { ensureExists } from "../utils/helper";



export async function createHistoryService<T>(
    tx: Prisma.TransactionClient,
    userId: number,
    action: string): Promise<void> {
    const user = await ensureExists(
        () => tx.users.findUnique({ where: { id: userId } }),
        "User"
    );
    const payload: CreateHistoriqueDto = {
        userId,
        action,
        createdAt: new Date(),
        acteur: user.name
    }
    tx.historique.create({ data: payload })

}


