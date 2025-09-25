import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { CreateAttendanceDto, UpdateAttendanceDto } from "../dtos/attendance.dto";
import { createAttendanceController, deleteAttendanceController, getAttendanceByIdController, getAttendancesController, updateAttendanceController } from "../controllers/attendance.controller";


const route = Router();

route.post("/", authMiddleware, requireRole("ADMIN"), validateDto(CreateAttendanceDto), createAttendanceController)
route.patch("/:id", authMiddleware, requireRole("ADMIN"), validateDto(UpdateAttendanceDto), updateAttendanceController)
route.get("/", authMiddleware, requireRole("ADMIN"), getAttendancesController)
route.get("/:id", authMiddleware, requireRole("ADMIN"), getAttendanceByIdController)
route.delete("/:id", authMiddleware, requireRole("ADMIN"), deleteAttendanceController)


export default route;