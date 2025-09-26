import { Router } from "express";
import { createLeaveRequestController, deleteLeaveRequestController, getLeaveRequestByIdController, getLeaveRequestsController, updateLeaveRequestController, updateStatusLeaveRequestController } from "../controllers/leaveRequest.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateDto } from "../middlewares/validateDto";
import { asyncWrapper } from "../utils/asyncWrapper";
import { CreateLeaveRequestDto, UpdateLeaveRequestDto } from "../dtos/leaveRequest.dto";
import { requireRole } from "../middlewares/authorization";

const router = Router();

router.post(
    "/",
    authMiddleware,
    validateDto(CreateLeaveRequestDto),
    asyncWrapper(createLeaveRequestController)
);

router.patch(
    "/status/:id",
    authMiddleware,
    requireRole("ADMIN"),
    validateDto(UpdateLeaveRequestDto),
    asyncWrapper(updateStatusLeaveRequestController)
);

router.patch(
    "/:id",
    authMiddleware,
    validateDto(UpdateLeaveRequestDto),
    asyncWrapper(updateLeaveRequestController)
);


router.get(
    "/",
    authMiddleware,
    asyncWrapper(getLeaveRequestsController)
);

router.get(
    "/:id",
    authMiddleware,
    asyncWrapper(getLeaveRequestByIdController)
);

router.delete(
    "/:id",
    authMiddleware,
    asyncWrapper(deleteLeaveRequestController)
);



export default router;