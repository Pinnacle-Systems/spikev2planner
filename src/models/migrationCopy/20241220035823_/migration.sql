/*
  Warnings:

  - A unique constraint covering the columns `[prevOrdersId]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `prevOrdersId` INTEGER NULL,
    ADD COLUMN `version` INTEGER NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX `Orders_prevOrdersId_key` ON `Orders`(`prevOrdersId`);

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_prevOrdersId_fkey` FOREIGN KEY (`prevOrdersId`) REFERENCES `Orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
