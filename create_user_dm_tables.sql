-- Create UserConversation table
CREATE TABLE IF NOT EXISTS `UserConversation` (
  `id` VARCHAR(191) NOT NULL,
  `userOneId` VARCHAR(191) NOT NULL,
  `userTwoId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserConversation_userOneId_userTwoId_key` (`userOneId`, `userTwoId`),
  KEY `UserConversation_userTwoId_idx` (`userTwoId`),
  CONSTRAINT `UserConversation_userOneId_fkey` FOREIGN KEY (`userOneId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserConversation_userTwoId_fkey` FOREIGN KEY (`userTwoId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create UserDm table
CREATE TABLE IF NOT EXISTS `UserDm` (
  `id` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `fileUrl` TEXT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `conversationId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `deleted` BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (`id`),
  KEY `UserDm_userId_idx` (`userId`),
  KEY `UserDm_conversationId_idx` (`conversationId`),
  CONSTRAINT `UserDm_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserDm_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `UserConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 