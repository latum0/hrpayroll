/*
  Warnings:

  - You are about to drop the column `isPublic` on the `document` table. All the data in the column will be lost.
  - You are about to drop the `paymentbatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `paymentbatchentry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payrolljournal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `paymentbatch` DROP FOREIGN KEY `PaymentBatch_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `paymentbatch` DROP FOREIGN KEY `PaymentBatch_payrollRunId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentbatchentry` DROP FOREIGN KEY `PaymentBatchEntry_employeeBankAccountId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentbatchentry` DROP FOREIGN KEY `PaymentBatchEntry_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentbatchentry` DROP FOREIGN KEY `PaymentBatchEntry_paymentBatchId_fkey`;

-- DropForeignKey
ALTER TABLE `payrolljournal` DROP FOREIGN KEY `PayrollJournal_payrollRunId_fkey`;

-- AlterTable
ALTER TABLE `document` DROP COLUMN `isPublic`;

-- DropTable
DROP TABLE `paymentbatch`;

-- DropTable
DROP TABLE `paymentbatchentry`;

-- DropTable
DROP TABLE `payrolljournal`;
