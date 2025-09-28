/*
  Warnings:

  - You are about to alter the column `status` on the `notification` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(16))`.

*/
-- AlterTable
ALTER TABLE `notification` MODIFY `userId` INTEGER NULL,
    MODIFY `status` ENUM('SENT', 'FAILED', 'READ') NOT NULL DEFAULT 'SENT';
