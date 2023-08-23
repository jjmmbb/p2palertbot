-- CreateTable
CREATE TABLE `Order` (
    `_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `fee` DOUBLE NOT NULL,
    `bot_fee` DOUBLE NOT NULL,
    `community_fee` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `fiat_amount` DOUBLE NULL,
    `min_amount` DOUBLE NOT NULL,
    `max_amount` DOUBLE NOT NULL,
    `fiat_code` VARCHAR(191) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `taken_at` DATETIME(3) NULL,
    `tg_chat_id` VARCHAR(191) NULL,
    `tg_order_message` VARCHAR(191) NULL,
    `tg_channel_message1` VARCHAR(191) NOT NULL,
    `price_from_api` BOOLEAN NOT NULL,
    `price_margin` DOUBLE NOT NULL,
    `community_id` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
