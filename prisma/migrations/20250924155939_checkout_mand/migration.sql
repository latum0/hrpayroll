/*
  Warnings:

  - Made the column `checkOut` on table `attendance` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `attendance` MODIFY `checkOut` DATETIME(3) NOT NULL;
