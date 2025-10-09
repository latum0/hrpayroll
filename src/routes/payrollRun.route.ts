import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { deletePayrollRunByIdController, getAllPayrollRunController, getPayrollRunByIdController, updatePayrollRunController } from "../controllers/payrollRun.controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import { validateDto } from "../middlewares/validateDto";
import { CreatePayrollRunDto, UpdatePayrollRunDto } from "../dtos/payrollRun.dto";

const route = Router()
route.post("/", authMiddleware, requireRole("ADMIN"), validateDto(CreatePayrollRunDto), asyncWrapper(getAllPayrollRunController))

route.get("/", authMiddleware, requireRole("ADMIN"), asyncWrapper(getAllPayrollRunController))

route.get("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(getPayrollRunByIdController))

route.patch("/:id", authMiddleware, requireRole("ADMIN"), validateDto(UpdatePayrollRunDto), asyncWrapper(updatePayrollRunController))

route.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(deletePayrollRunByIdController))

export default route;