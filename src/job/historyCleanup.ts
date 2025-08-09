import cron from "node-cron";
import { deleteOldHistoriques } from "../services/history.service";


export function scheduleHistoriqueCleanup(cronExpr = "0 0 * * *") {
    cron.schedule(cronExpr, async () => {
        try {
            const result = await deleteOldHistoriques();
            if (result.count > 0) {
                console.log(`Deleted ${result.count} historiques older than 7 days.`);
            }
        } catch (err) {
            console.error("Error running historique cleanup job:", err);
        }
    });

    console.log(`[Scheduler] Historique cleanup scheduled (${cronExpr})`);
}
