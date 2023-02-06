-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telegramId` BIGINT NOT NULL,
    `chatId` BIGINT NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'en',

    UNIQUE INDEX `User_telegramId_key`(`telegramId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `priceDelta` DOUBLE NOT NULL,
    `orderType` ENUM('BUY', 'SELL') NOT NULL,

    UNIQUE INDEX `Alert_userId_currency_orderType_key`(`userId`, `currency`, `orderType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duration` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `preimage` VARCHAR(191) NULL,
    `paymentHash` VARCHAR(191) NOT NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `subscriptionId` INTEGER NOT NULL,
    `amount` BIGINT NOT NULL,
    `created` DATETIME(3) NOT NULL,
    `duration` INTEGER NOT NULL,
    `invoice` VARCHAR(1500) NOT NULL,

    UNIQUE INDEX `Payment_paymentHash_key`(`paymentHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Delivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `alertId` INTEGER NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Delivery_userId_orderId_key`(`userId`, `orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Alert` ADD CONSTRAINT `Alert_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_alertId_fkey` FOREIGN KEY (`alertId`) REFERENCES `Alert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
