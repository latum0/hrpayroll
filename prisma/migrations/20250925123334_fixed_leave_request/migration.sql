/*
  Warnings:

  - You are about to drop the column `requestedById` on the `leaverequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_requestedById_fkey`;

-- DropIndex
DROP INDEX `LeaveRequest_requestedById_fkey` ON `leaverequest`;

-- AlterTable
ALTER TABLE `leaverequest` DROP COLUMN `requestedById`,
    ADD COLUMN `usersId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_usersId_fkey` FOREIGN KEY (`usersId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
