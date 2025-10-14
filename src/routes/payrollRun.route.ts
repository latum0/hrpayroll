import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { getPayrollRunByIdController } from "../controllers/payrollRun.controller";

const route = Router()

route.get("/:id", authMiddleware, requireRole("ADMIN"), getPayrollRunByIdController)


export default route;