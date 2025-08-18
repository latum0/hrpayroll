/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `name`,
    ADD COLUMN `companyId` INTEGER NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    ADD COLUMN `status` ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED') NOT NULL DEFAULT 'PENDING',
    MODIFY `phone` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `dob` DATETIME(3) NULL,
    `nationalId` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NULL,
    `hireDate` DATETIME(3) NULL,
    `terminationDate` DATETIME(3) NULL,
    `status` ENUM('ONBOARDING', 'ACTIVE', 'ON_LEAVE', 'OFFBOARDING', 'TERMINATED') NOT NULL DEFAULT 'ONBOARDING',
    `managerId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `departmentId` INTEGER NOT NULL,

    INDEX `Employee_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `legalName` VARCHAR(191) NULL,
    `plan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Company_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Billing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerCustomerId` VARCHAR(191) NULL,
    `providerSubscriptionId` VARCHAR(191) NULL,
    `plan` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'PAST_DUE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `trialEndsAt` DATETIME(3) NULL,
    `nextBillingAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Billing_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `payslipId` INTEGER NULL,
    `contractId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `employeeId` INTEGER NULL,
    `type` ENUM('CONTRACT', 'PAYSLIP') NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `fileKey` VARCHAR(191) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Document_payslipId_key`(`payslipId`),
    UNIQUE INDEX `Document_contractId_key`(`contractId`),
    INDEX `Document_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeBankAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `accountHolderName` VARCHAR(191) NULL,
    `iban` VARCHAR(191) NOT NULL,
    `bic` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmployeeBankAccount_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Department_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmploymentContract` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `payFrequency` ENUM('MONTHLY', 'WEEKLY', 'BIWEEKLY') NOT NULL DEFAULT 'MONTHLY',
    `payType` ENUM('HOURLY', 'SALARY') NOT NULL DEFAULT 'SALARY',
    `status` ENUM('ACTIVE', 'PENDING', 'ENDED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `companyId` INTEGER NULL,

    INDEX `EmploymentContract_employeeId_idx`(`employeeId`),
    INDEX `EmploymentContract_employeeId_startDate_idx`(`employeeId`, `startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalaryComponent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `code` ENUM('LOAN', 'TAX', 'TRANSPORT', 'BASE') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `componentType` ENUM('EARNING', 'EMPLOYER_CONTRIBUTION', 'DEDUCTION') NOT NULL,
    `taxable` BOOLEAN NOT NULL DEFAULT true,
    `employerPaid` BOOLEAN NOT NULL DEFAULT false,
    `defaultAmount` DECIMAL(65, 30) NULL,
    `capAmount` DECIMAL(65, 30) NULL,
    `glAccount` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SalaryComponent_companyId_idx`(`companyId`),
    INDEX `SalaryComponent_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractSalaryComponent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contractId` INTEGER NOT NULL,
    `salaryComponentId` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContractSalaryComponent_contractId_idx`(`contractId`),
    INDEX `ContractSalaryComponent_salaryComponentId_idx`(`salaryComponentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayrollRun` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `status` ENUM('DRAFT', 'PREVIEW', 'APPROVED', 'PAID', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `managedById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalGross` DECIMAL(65, 30) NULL,
    `totalTax` DECIMAL(65, 30) NULL,
    `totalNet` DECIMAL(65, 30) NULL,
    `totalEmployerContrib` DECIMAL(65, 30) NULL,

    INDEX `PayrollRun_companyId_periodStart_periodEnd_idx`(`companyId`, `periodStart`, `periodEnd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payslip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payrollRunId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `employmentContractId` INTEGER NULL,
    `grossAmount` DECIMAL(65, 30) NOT NULL,
    `taxAmount` DECIMAL(65, 30) NOT NULL,
    `deductionsAmount` DECIMAL(65, 30) NOT NULL,
    `netAmount` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('DRAFT', 'PREVIEW', 'APPROVED', 'PAID', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paidAt` DATETIME(3) NULL,

    INDEX `Payslip_payrollRunId_idx`(`payrollRunId`),
    INDEX `Payslip_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayrollLine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payslipId` INTEGER NOT NULL,
    `salaryComponentId` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `taxable` BOOLEAN NOT NULL DEFAULT true,
    `side` ENUM('EMPLOYEE', 'EMPLOYER') NOT NULL DEFAULT 'EMPLOYEE',
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PayrollLine_payslipId_idx`(`payslipId`),
    INDEX `PayrollLine_salaryComponentId_idx`(`salaryComponentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentBatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payrollRunId` INTEGER NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NULL,
    `status` ENUM('PREPARED', 'SUBMITTED', 'SETTLED', 'FAILED') NOT NULL DEFAULT 'PREPARED',
    `totalAmount` DECIMAL(65, 30) NULL,
    `entriesCount` INTEGER NOT NULL DEFAULT 0,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentBatch_payrollRunId_idx`(`payrollRunId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentBatchEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentBatchId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `employeeBankAccountId` INTEGER NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentBatchEntry_paymentBatchId_idx`(`paymentBatchId`),
    INDEX `PaymentBatchEntry_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayrollJournal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payrollRunId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `entryDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accountCode` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `debit` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `credit` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `exportedAt` DATETIME(3) NULL,
    `externalId` VARCHAR(191) NULL,

    INDEX `PayrollJournal_payrollRunId_idx`(`payrollRunId`),
    INDEX `PayrollJournal_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `checkIn` DATETIME(3) NOT NULL,
    `checkOut` DATETIME(3) NULL,
    `validatedById` INTEGER NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `payrollRunId` INTEGER NULL,

    INDEX `Attendance_employeeId_checkIn_idx`(`employeeId`, `checkIn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `departmentId` INTEGER NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `type` ENUM('VACATION', 'SICK', 'UNPAID', 'OTHER') NOT NULL,
    `days` DOUBLE NULL,
    `status` ENUM('APPROVED', 'PENDING', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `requestedById` INTEGER NULL,
    `approvedById` INTEGER NULL,
    `reason` VARCHAR(191) NULL,
    `payrollNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,
    `payrollRunId` INTEGER NULL,

    INDEX `LeaveRequest_employeeId_idx`(`employeeId`),
    INDEX `LeaveRequest_departmentId_idx`(`departmentId`),
    INDEX `LeaveRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Absence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `type` ENUM('SICK', 'UNPAID') NULL,
    `hours` DOUBLE NULL,
    `leaveRequestId` INTEGER NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `payrollRunId` INTEGER NULL,

    INDEX `Absence_employeeId_date_idx`(`employeeId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `companyId` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `template` VARCHAR(191) NULL,
    `payload` JSON NULL,
    `status` ENUM('SENT', 'FAILED', 'READ', 'QUEUED') NOT NULL DEFAULT 'QUEUED',
    `error` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `employeeId` INTEGER NULL,
    `payslipId` INTEGER NULL,

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_companyId_idx`(`companyId`),
    INDEX `Notification_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_id_fkey` FOREIGN KEY (`id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Billing` ADD CONSTRAINT `Billing_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_payslipId_fkey` FOREIGN KEY (`payslipId`) REFERENCES `Payslip`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `EmploymentContract`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeBankAccount` ADD CONSTRAINT `EmployeeBankAccount_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmploymentContract` ADD CONSTRAINT `EmploymentContract_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmploymentContract` ADD CONSTRAINT `EmploymentContract_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalaryComponent` ADD CONSTRAINT `SalaryComponent_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractSalaryComponent` ADD CONSTRAINT `ContractSalaryComponent_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `EmploymentContract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractSalaryComponent` ADD CONSTRAINT `ContractSalaryComponent_salaryComponentId_fkey` FOREIGN KEY (`salaryComponentId`) REFERENCES `SalaryComponent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollRun` ADD CONSTRAINT `PayrollRun_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollRun` ADD CONSTRAINT `PayrollRun_managedById_fkey` FOREIGN KEY (`managedById`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_employmentContractId_fkey` FOREIGN KEY (`employmentContractId`) REFERENCES `EmploymentContract`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollLine` ADD CONSTRAINT `PayrollLine_payslipId_fkey` FOREIGN KEY (`payslipId`) REFERENCES `Payslip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollLine` ADD CONSTRAINT `PayrollLine_salaryComponentId_fkey` FOREIGN KEY (`salaryComponentId`) REFERENCES `SalaryComponent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollLine` ADD CONSTRAINT `PayrollLine_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatch` ADD CONSTRAINT `PaymentBatch_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatch` ADD CONSTRAINT `PaymentBatch_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatchEntry` ADD CONSTRAINT `PaymentBatchEntry_paymentBatchId_fkey` FOREIGN KEY (`paymentBatchId`) REFERENCES `PaymentBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatchEntry` ADD CONSTRAINT `PaymentBatchEntry_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatchEntry` ADD CONSTRAINT `PaymentBatchEntry_employeeBankAccountId_fkey` FOREIGN KEY (`employeeBankAccountId`) REFERENCES `EmployeeBankAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollJournal` ADD CONSTRAINT `PayrollJournal_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollJournal` ADD CONSTRAINT `PayrollJournal_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_validatedById_fkey` FOREIGN KEY (`validatedById`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_leaveRequestId_fkey` FOREIGN KEY (`leaveRequestId`) REFERENCES `LeaveRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_payslipId_fkey` FOREIGN KEY (`payslipId`) REFERENCES `Payslip`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
