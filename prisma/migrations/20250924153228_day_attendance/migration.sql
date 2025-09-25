/*
  Warnings:

  - You are about to drop the `billing` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `day` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `day` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `billing`;
