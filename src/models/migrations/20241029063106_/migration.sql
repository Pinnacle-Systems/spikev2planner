-- DropForeignKey
ALTER TABLE `learningcurveitems` DROP FOREIGN KEY `LearningCurveItems_orderLinesId_fkey`;

-- AddForeignKey
ALTER TABLE `LearningCurveItems` ADD CONSTRAINT `LearningCurveItems_orderLinesId_fkey` FOREIGN KEY (`orderLinesId`) REFERENCES `OrderLines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
