import { Router } from "express";
import {
    createEmployeeController,
    updateEmployeeController,
    getEmployeeByIdController,
    getEmployeesController,
    deleteEmployeeController,
    getEmployeesByDepartController,

} from "../controllers/employee.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateDto } from "../middlewares/validateDto";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos/employee.dto";
import { asyncWrapper } from "../utils/asyncWrapper";
import { requireRole } from "../middlewares/authorization";


const router = Router();

router.post("/", authMiddleware, requireRole("ADMIN"), validateDto(CreateEmployeeDto), asyncWrapper(createEmployeeController));

router.get("/", authMiddleware, requireRole("ADMIN"), asyncWrapper(getEmployeesController));

//getting all the employees of the same department of the employee logged in
router.get("/department", authMiddleware, requireRole("ADMIN"), asyncWrapper(getEmployeesByDepartController));

router.get("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(getEmployeeByIdController));

router.patch("/:id", authMiddleware, requireRole("ADMIN"), validateDto(UpdateEmployeeDto), asyncWrapper(updateEmployeeController));

router.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(deleteEmployeeController));

export default router;
