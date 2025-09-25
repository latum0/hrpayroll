/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,day]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Made the column `validatedById` on table `attendance` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_validatedById_fkey`;

-- DropIndex
DROP INDEX `Attendance_validatedById_fkey` ON `attendance`;

-- AlterTable
ALTER TABLE `attendance` MODIFY `validatedById` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Attendance_employeeId_day_key` ON `Attendance`(`employeeId`, `day`);

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_validatedById_fkey` FOREIGN KEY (`validatedById`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
