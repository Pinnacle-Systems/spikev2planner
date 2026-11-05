-- AlterTable
ALTER TABLE `orders` ADD COLUMN `amendments` JSON NULL,
    ADD COLUMN `erpQty` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL DEFAULT 'Pending';
