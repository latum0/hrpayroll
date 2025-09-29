/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `employeebankaccount` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `employeebankaccount` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `employeebankaccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rip]` on the table `EmployeeBankAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `employeebankaccount` DROP COLUMN `isPrimary`,
    DROP COLUMN `verified`,
    DROP COLUMN `verifiedAt`,
    ADD COLUMN `ccpAccountNumber` VARCHAR(20) NULL,
    ADD COLUMN `ccpKey` VARCHAR(2) NULL,
    ADD COLUMN `rip` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `EmployeeBankAccount_rip_key` ON `EmployeeBankAccount`(`rip`);
