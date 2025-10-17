import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { deletePayrollRunByIdController, getAllPayrollRunController, getPayrollRunByIdController } from "../controllers/payrollRun.controller";
import { asyncWrapper } from "../utils/asyncWrapper";

const route = Router()

route.get("/", authMiddleware, requireRole("ADMIN"), asyncWrapper(getAllPayrollRunController))

route.get("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(getPayrollRunByIdController))

route.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(deletePayrollRunByIdController))

export default route;