-- AlterTable
ALTER TABLE `orderlines` ADD COLUMN `capacity` INTEGER NULL DEFAULT 0,
    ADD COLUMN `efficiency` INTEGER NULL DEFAULT 0;
