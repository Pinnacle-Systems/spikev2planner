-- AlterTable
ALTER TABLE `employee` ADD COLUMN `aadharNo` VARCHAR(191) NULL,
    ADD COLUMN `accountNo` VARCHAR(191) NULL,
    ADD COLUMN `active` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `bankName` VARCHAR(191) NULL,
    ADD COLUMN `bloodGroup` VARCHAR(191) NULL,
    ADD COLUMN `branchName` VARCHAR(191) NULL,
    ADD COLUMN `canRejoin` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `commissionCharges` VARCHAR(191) NULL,
    ADD COLUMN `consultFee` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `degree` VARCHAR(191) NULL,
    ADD COLUMN `departmentId` INTEGER NULL,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `dob` DATETIME(3) NULL,
    ADD COLUMN `employeeCategoryId` INTEGER NULL,
    ADD COLUMN `employeeId` VARCHAR(191) NULL,
    ADD COLUMN `fatherName` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `ifscNo` VARCHAR(191) NULL,
    ADD COLUMN `image` LONGBLOB NULL,
    ADD COLUMN `joiningDate` DATETIME(3) NULL,
    ADD COLUMN `leavingDate` DATETIME(3) NULL,
    ADD COLUMN `leavingReason` VARCHAR(191) NULL,
    ADD COLUMN `localAddress` VARCHAR(191) NULL,
    ADD COLUMN `localCityId` INTEGER NULL,
    ADD COLUMN `localPincode` INTEGER NULL,
    ADD COLUMN `maritalStatus` VARCHAR(191) NULL,
    ADD COLUMN `mobile` BIGINT NULL,
    ADD COLUMN `panNo` VARCHAR(191) NULL,
    ADD COLUMN `permAddress` VARCHAR(191) NULL,
    ADD COLUMN `permCityId` INTEGER NULL,
    ADD COLUMN `permPincode` INTEGER NULL,
    ADD COLUMN `permanent` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `rejoinReason` VARCHAR(191) NULL,
    ADD COLUMN `salaryPerMonth` VARCHAR(191) NULL,
    ADD COLUMN `specialization` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `State` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `gstNo` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `stateId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `defaultCategory` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_localCityId_fkey` FOREIGN KEY (`localCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_permCityId_fkey` FOREIGN KEY (`permCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_employeeCategoryId_fkey` FOREIGN KEY (`employeeCategoryId`) REFERENCES `EmployeeCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Country` ADD CONSTRAINT `Country_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `State` ADD CONSTRAINT `State_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeCategory` ADD CONSTRAINT `EmployeeCategory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
