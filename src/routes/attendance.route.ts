import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { CreateAttendanceDto, UpdateAttendanceDto } from "../dtos/attendance.dto";
import { createAttendanceController, deleteAttendanceController, getAttendanceByIdController, getAttendancesController, updateAttendanceController } from "../controllers/attendance.controller";


const route = Router();

route.post("/", authMiddleware, requireRole("MANAGER"), validateDto(CreateAttendanceDto), createAttendanceController)
route.patch("/:id", authMiddleware, requireRole("MANAGER"), validateDto(UpdateAttendanceDto), updateAttendanceController)
route.get("/", authMiddleware, requireRole("MANAGER"), getAttendancesController)
route.get("/:id", authMiddleware, requireRole("MANAGER"), getAttendanceByIdController)
route.delete("/:id", authMiddleware, requireRole("MANAGER"), deleteAttendanceController)


export default route;