-- DropForeignKey
ALTER TABLE `orderlines` DROP FOREIGN KEY `OrderLines_ordersId_fkey`;

-- AddForeignKey
ALTER TABLE `OrderLines` ADD CONSTRAINT `OrderLines_ordersId_fkey` FOREIGN KEY (`ordersId`) REFERENCES `Orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
