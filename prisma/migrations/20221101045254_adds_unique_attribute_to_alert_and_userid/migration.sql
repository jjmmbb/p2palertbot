/*
  Warnings:

  - A unique constraint covering the columns `[userId,alertId]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Delivery_userId_alertId_key` ON `Delivery`(`userId`, `alertId`);
