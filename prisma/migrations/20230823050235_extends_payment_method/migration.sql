/*
  Warnings:

  - A unique constraint covering the columns `[_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `payment_method` TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Order__id_key` ON `Order`(`_id`);
