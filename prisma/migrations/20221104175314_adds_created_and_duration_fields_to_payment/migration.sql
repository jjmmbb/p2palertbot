/*
  Warnings:

  - Added the required column `created` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `created` DATETIME(3) NOT NULL,
    ADD COLUMN `duration` INTEGER NOT NULL;
