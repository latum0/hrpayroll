import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { createNotificationController, createNotificationDepartmentController, createNotificationEmployeeController, deleteNotificationsController, getNotificationByIdController, getNotificationsController, getNotificationsDepartmentController, getNotificationsEmployeeController, updateStatusNotificationsController } from "../controllers/notification.controller";
import { CreateNotificationDepartmentDto, CreateNotificationDto, CreateNotificationEmployeeDto, UpdateNotificationStatusDto } from "../dtos/notification.dto";
import { asyncWrapper } from "../utils/asyncWrapper";


const route = Router();

route.post("/all", authMiddleware, requireRole("ADMIN"), validateDto(CreateNotificationDto), asyncWrapper(createNotificationController))
route.post("/employee", authMiddleware, requireRole("ADMIN"), validateDto(CreateNotificationEmployeeDto), asyncWrapper(createNotificationEmployeeController))
route.post("/department", authMiddleware, requireRole("ADMIN"), validateDto(CreateNotificationDepartmentDto), asyncWrapper(createNotificationDepartmentController))
route.get("/", authMiddleware, requireRole("ADMIN"), asyncWrapper(getNotificationsController))
//getting notifications for the employee logged in 
route.get("/employee", authMiddleware, asyncWrapper(getNotificationsEmployeeController))

//getting notifications of the whole department of the employee logged in 
route.get("/department", authMiddleware, asyncWrapper(getNotificationsDepartmentController))
route.get("/:id", authMiddleware, asyncWrapper(getNotificationByIdController))
route.patch("/:id", authMiddleware, requireRole("ADMIN"), validateDto(UpdateNotificationStatusDto), asyncWrapper(updateStatusNotificationsController))
route.delete("/:id", authMiddleware, requireRole("ADMIN"), asyncWrapper(deleteNotificationsController))


export default route;