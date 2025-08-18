-- DropForeignKey
ALTER TABLE `contractsalarycomponent` DROP FOREIGN KEY `ContractSalaryComponent_contractId_fkey`;

-- DropForeignKey
ALTER TABLE `contractsalarycomponent` DROP FOREIGN KEY `ContractSalaryComponent_salaryComponentId_fkey`;

-- DropForeignKey
ALTER TABLE `department` DROP FOREIGN KEY `Department_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `document` DROP FOREIGN KEY `Document_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_id_fkey`;

-- DropForeignKey
ALTER TABLE `employeebankaccount` DROP FOREIGN KEY `EmployeeBankAccount_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employmentcontract` DROP FOREIGN KEY `EmploymentContract_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentbatch` DROP FOREIGN KEY `PaymentBatch_payrollRunId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentbatchentry` DROP FOREIGN KEY `PaymentBatchEntry_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentbatchentry` DROP FOREIGN KEY `PaymentBatchEntry_paymentBatchId_fkey`;

-- DropForeignKey
ALTER TABLE `payrolljournal` DROP FOREIGN KEY `PayrollJournal_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `payrolljournal` DROP FOREIGN KEY `PayrollJournal_payrollRunId_fkey`;

-- DropForeignKey
ALTER TABLE `payrollline` DROP FOREIGN KEY `PayrollLine_payslipId_fkey`;

-- DropForeignKey
ALTER TABLE `payrollline` DROP FOREIGN KEY `PayrollLine_salaryComponentId_fkey`;

-- DropForeignKey
ALTER TABLE `payrollrun` DROP FOREIGN KEY `PayrollRun_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `payrollrun` DROP FOREIGN KEY `PayrollRun_managedById_fkey`;

-- DropForeignKey
ALTER TABLE `payslip` DROP FOREIGN KEY `Payslip_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `payslip` DROP FOREIGN KEY `Payslip_payrollRunId_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `salarycomponent` DROP FOREIGN KEY `SalaryComponent_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `userpermission` DROP FOREIGN KEY `UserPermission_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `userpermission` DROP FOREIGN KEY `UserPermission_userId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_roleId_fkey`;

-- DropIndex
DROP INDEX `Document_companyId_fkey` ON `document`;

-- DropIndex
DROP INDEX `Employee_departmentId_fkey` ON `employee`;

-- DropIndex
DROP INDEX `PayrollRun_managedById_fkey` ON `payrollrun`;

-- DropIndex
DROP INDEX `RolePermission_permissionId_fkey` ON `rolepermission`;

-- DropIndex
DROP INDEX `UserPermission_permissionId_fkey` ON `userpermission`;

-- DropIndex
DROP INDEX `Users_roleId_fkey` ON `users`;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_id_fkey` FOREIGN KEY (`id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeBankAccount` ADD CONSTRAINT `EmployeeBankAccount_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmploymentContract` ADD CONSTRAINT `EmploymentContract_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalaryComponent` ADD CONSTRAINT `SalaryComponent_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractSalaryComponent` ADD CONSTRAINT `ContractSalaryComponent_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `EmploymentContract`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractSalaryComponent` ADD CONSTRAINT `ContractSalaryComponent_salaryComponentId_fkey` FOREIGN KEY (`salaryComponentId`) REFERENCES `SalaryComponent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollRun` ADD CONSTRAINT `PayrollRun_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollRun` ADD CONSTRAINT `PayrollRun_managedById_fkey` FOREIGN KEY (`managedById`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollLine` ADD CONSTRAINT `PayrollLine_payslipId_fkey` FOREIGN KEY (`payslipId`) REFERENCES `Payslip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollLine` ADD CONSTRAINT `PayrollLine_salaryComponentId_fkey` FOREIGN KEY (`salaryComponentId`) REFERENCES `SalaryComponent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatch` ADD CONSTRAINT `PaymentBatch_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatchEntry` ADD CONSTRAINT `PaymentBatchEntry_paymentBatchId_fkey` FOREIGN KEY (`paymentBatchId`) REFERENCES `PaymentBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentBatchEntry` ADD CONSTRAINT `PaymentBatchEntry_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollJournal` ADD CONSTRAINT `PayrollJournal_payrollRunId_fkey` FOREIGN KEY (`payrollRunId`) REFERENCES `PayrollRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollJournal` ADD CONSTRAINT `PayrollJournal_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
