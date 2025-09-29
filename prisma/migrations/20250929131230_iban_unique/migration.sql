/*
  Warnings:

  - A unique constraint covering the columns `[iban]` on the table `EmployeeBankAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `EmployeeBankAccount_iban_key` ON `EmployeeBankAccount`(`iban`);
