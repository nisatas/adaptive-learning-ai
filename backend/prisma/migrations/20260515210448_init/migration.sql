-- CreateTable
CREATE TABLE `StudentSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NULL,
    `quizId` VARCHAR(191) NOT NULL,
    `lesson` VARCHAR(191) NOT NULL,
    `gradeLevel` INTEGER NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `totalQuestions` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `correctCount` INTEGER NOT NULL,
    `wrongCount` INTEGER NOT NULL,
    `skippedCount` INTEGER NOT NULL,
    `averageTimeSeconds` INTEGER NOT NULL,
    `mostDifficultTopic` VARCHAR(191) NULL,
    `studentMessage` VARCHAR(191) NULL,
    `uiSettingsJson` JSON NOT NULL,
    `behaviorSignalsJson` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StudentSubmission_studentId_createdAt_idx`(`studentId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizAnswerRecord` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `selectedOptionId` VARCHAR(191) NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `skipped` BOOLEAN NOT NULL,
    `timeSpentSeconds` INTEGER NULL,
    `topic` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `QuizAnswerRecord_submissionId_idx`(`submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherReportRecord` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NULL,
    `quizId` VARCHAR(191) NULL,
    `lesson` VARCHAR(191) NOT NULL,
    `gradeLevel` INTEGER NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `totalQuestions` INTEGER NOT NULL,
    `correctCount` INTEGER NOT NULL,
    `wrongCount` INTEGER NOT NULL,
    `skippedCount` INTEGER NOT NULL,
    `averageTimeSeconds` INTEGER NOT NULL,
    `mostDifficultTopic` VARCHAR(191) NULL,
    `behaviorObservation` TEXT NOT NULL,
    `systemRecommendation` TEXT NOT NULL,
    `aiTeacherNote` TEXT NOT NULL,
    `aiProvider` VARCHAR(191) NOT NULL,
    `aiUsed` BOOLEAN NOT NULL,
    `fallbackUsed` BOOLEAN NOT NULL,
    `aiStatus` VARCHAR(191) NOT NULL,
    `reportSource` VARCHAR(191) NOT NULL,
    `generatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TeacherReportRecord_studentId_createdAt_idx`(`studentId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuizAnswerRecord` ADD CONSTRAINT `QuizAnswerRecord_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `StudentSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
