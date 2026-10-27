-- AlterTable
ALTER TABLE `orderlines` ADD COLUMN `active` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `unit` ADD COLUMN `active` BOOLEAN NULL DEFAULT false;
