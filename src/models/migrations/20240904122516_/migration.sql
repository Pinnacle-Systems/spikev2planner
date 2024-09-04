-- DropForeignKey
ALTER TABLE `ordersizecolorwisedetails` DROP FOREIGN KEY `OrderSizeColorWiseDetails_ordersId_fkey`;

-- AddForeignKey
ALTER TABLE `OrderSizeColorWiseDetails` ADD CONSTRAINT `OrderSizeColorWiseDetails_ordersId_fkey` FOREIGN KEY (`ordersId`) REFERENCES `Orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
