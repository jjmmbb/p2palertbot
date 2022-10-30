/*
  Warnings:

  - A unique constraint covering the columns `[userId,currency,orderType]` on the table `Alert` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Alert_userId_currency_orderType_key` ON `Alert`(`userId`, `currency`, `orderType`);
