-- DropForeignKey
ALTER TABLE `absence` DROP FOREIGN KEY `Absence_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `absence` DROP FOREIGN KEY `Absence_leaveRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `absence` DROP FOREIGN KEY `Absence_payrollRunId_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_payrollRunId_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_validatedById_fkey`;

-- DropForeignKey
ALTER TABLE `billing` DROP FOREIGN KEY `Billing_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `document` DROP FOREIGN KEY `Document_userId_fkey`;

-- DropForeignKey
ALTER TABLE `historique` DROP FOREIGN KEY `Historique_userId_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_approvedById_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_payrollRunId_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_requestedById_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentbatch` DROP FOREIGN KEY `PaymentBatch_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `payrollline` DROP FOREIGN KEY `PayrollLine_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_companyId_fkey`;

-- DropIndex
DROP INDEX `Absence_leaveRequestId_fkey` ON `absence`;

-- DropIndex
DROP INDEX `Absence_payrollRunId_fkey` ON `absence`;

-- DropIndex
DROP INDEX `Attendance_payrollRunId_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `Attendance_validatedById_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `Historique_userId_fkey` ON `historique`;

-- DropIndex
DROP INDEX `LeaveRequest_approvedById_fkey` ON `leaverequest`;

-- DropIndex
DROP INDEX `LeaveRequest_payrollRunId_fkey` ON `leaverequest`;

-- DropIndex
DROP INDEX `LeaveRequest_requestedById_fkey` ON `leaverequest`;

-- DropIndex
DROP INDEX `PaymentBatch_createdById_fkey` ON `paymentbatch`;

-- DropIndex
DROP INDEX `PayrollLine_createdById_fkey` ON `payrollline`;

-- DropIndex
DROP INDEX `Users_companyId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `billing` MODIFY `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historique` ADD CONSTRAINT `Historique_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Billing` ADD CONSTRAINT `Billing_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollLine` ADD CONSTRAINT `PayrollLine_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatch` ADD CONSTRAINT `PaymentBatch_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_validatedById_fkey` FOREIGN KEY (`validatedById`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_leaveRequestId_fkey` FOREIGN KEY (`leaveRequestId`) REFERENCES `LeaveRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
