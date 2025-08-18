/*
  Warnings:

  - You are about to drop the column `companyId` on the `billing` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `employmentcontract` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `payrolljournal` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `payrollrun` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `salarycomponent` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `company` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `billing` DROP FOREIGN KEY `Billing_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `department` DROP FOREIGN KEY `Department_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `document` DROP FOREIGN KEY `Document_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `employmentcontract` DROP FOREIGN KEY `EmploymentContract_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `payrolljournal` DROP FOREIGN KEY `PayrollJournal_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `payrollrun` DROP FOREIGN KEY `PayrollRun_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `salarycomponent` DROP FOREIGN KEY `SalaryComponent_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_companyId_fkey`;

-- DropIndex
DROP INDEX `Billing_companyId_idx` ON `billing`;

-- DropIndex
DROP INDEX `Department_companyId_idx` ON `department`;

-- DropIndex
DROP INDEX `Document_companyId_fkey` ON `document`;

-- DropIndex
DROP INDEX `Employee_companyId_idx` ON `employee`;

-- DropIndex
DROP INDEX `EmploymentContract_companyId_fkey` ON `employmentcontract`;

-- DropIndex
DROP INDEX `Notification_companyId_idx` ON `notification`;

-- DropIndex
DROP INDEX `PayrollJournal_companyId_idx` ON `payrolljournal`;

-- DropIndex
DROP INDEX `PayrollRun_companyId_periodStart_periodEnd_idx` ON `payrollrun`;

-- DropIndex
DROP INDEX `SalaryComponent_companyId_idx` ON `salarycomponent`;

-- DropIndex
DROP INDEX `Users_companyId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `billing` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `department` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `document` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `employee` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `employmentcontract` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `payrolljournal` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `payrollrun` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `salarycomponent` DROP COLUMN `companyId`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `companyId`;

-- DropTable
DROP TABLE `company`;

-- CreateIndex
CREATE INDEX `PayrollRun_periodStart_periodEnd_idx` ON `PayrollRun`(`periodStart`, `periodEnd`);
