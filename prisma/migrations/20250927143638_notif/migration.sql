/*
  Warnings:

  - Made the column `payload` on table `notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `notification` MODIFY `payload` VARCHAR(191) NOT NULL;
