/*
  Warnings:

  - Added the required column `acteur` to the `Historique` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `historique` ADD COLUMN `acteur` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `roleId` INTEGER NOT NULL DEFAULT 1;
