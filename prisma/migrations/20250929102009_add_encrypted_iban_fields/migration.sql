/*
  Warnings:

  - A unique constraint covering the columns `[ibanHash]` on the table `EmployeeBankAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `employeebankaccount` ADD COLUMN `ibanCiphertext` VARCHAR(191) NULL,
    ADD COLUMN `ibanHash` VARCHAR(191) NULL,
    ADD COLUMN `ibanIv` VARCHAR(191) NULL,
    ADD COLUMN `ibanLast4` VARCHAR(191) NULL,
    ADD COLUMN `ibanMasked` VARCHAR(191) NULL,
    ADD COLUMN `ibanTag` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `EmployeeBankAccount_ibanHash_key` ON `EmployeeBankAccount`(`ibanHash`);
