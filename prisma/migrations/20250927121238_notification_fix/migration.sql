/*
  Warnings:

  - You are about to drop the column `channel` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_usersId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_employeeId_fkey`;

-- DropIndex
DROP INDEX `LeaveRequest_usersId_fkey` ON `leaverequest`;

-- DropIndex
DROP INDEX `Notification_employeeId_fkey` ON `notification`;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `channel`,
    DROP COLUMN `employeeId`,
    DROP COLUMN `error`,
    DROP COLUMN `template`;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_usersId_fkey` FOREIGN KEY (`usersId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
