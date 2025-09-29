import { Router } from "express";
import { createBankAccountController } from "../controllers/bankAccount.controller";
import { getBankAccountsController, getBankAccountByIdController, updateBankAccountController, deleteBankAccountController } from "../controllers/bankAccount.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authorization";
import { validateDto } from "../middlewares/validateDto";
import { CreateBankAccountDto } from "../dtos/bankAccount.dto";
import { asyncWrapper } from "../utils/asyncWrapper";

const router = Router();

router.post(
    "/",
    authMiddleware,
    requireRole("ADMIN", "MANAGER"),
    validateDto(CreateBankAccountDto),
    asyncWrapper(createBankAccountController)
);

router.get("/", authMiddleware, asyncWrapper(getBankAccountsController));
router.get("/:id", authMiddleware, asyncWrapper(getBankAccountByIdController));
router.patch("/:id", authMiddleware, requireRole("ADMIN", "MANAGER"), asyncWrapper(updateBankAccountController));
router.delete("/:id", authMiddleware, requireRole("ADMIN", "MANAGER"), asyncWrapper(deleteBankAccountController));

export default router;