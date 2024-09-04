-- CreateTable
CREATE TABLE `OrderSizeColorWiseDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordersId` INTEGER NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `qty` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderSizeColorWiseDetails` ADD CONSTRAINT `OrderSizeColorWiseDetails_ordersId_fkey` FOREIGN KEY (`ordersId`) REFERENCES `Orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
