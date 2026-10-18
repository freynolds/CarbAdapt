-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `name` VARCHAR(191) NULL,
    `locale` ENUM('EN_US', 'ES', 'PT') NOT NULL DEFAULT 'EN_US',
    `theme` ENUM('SYSTEM', 'LIGHT', 'DARK') NOT NULL DEFAULT 'SYSTEM',
    `timezone` VARCHAR(191) NOT NULL,
    `mode` ENUM('FUEL_MY_WORKOUTS', 'GUT_TRAINING') NULL,
    `briefingTimeLocal` VARCHAR(191) NULL,
    `briefingDayBefore` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthIdentity` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` ENUM('EMAIL_MAGIC_LINK', 'STRAVA', 'TRAININGPEAKS', 'GARMIN', 'APPLE') NOT NULL,
    `providerUserId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `linkedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AuthIdentity_provider_providerUserId_key`(`provider`, `providerUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MagicLinkToken` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,

    UNIQUE INDEX `MagicLinkToken_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OnboardingAnswers` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `anonId` VARCHAR(191) NOT NULL,
    `answers` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `OnboardingAnswers_userId_key`(`userId`),
    UNIQUE INDEX `OnboardingAnswers_anonId_key`(`anonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhysicalData` (
    `userId` VARCHAR(191) NOT NULL,
    `weightKg` DECIMAL(5, 2) NULL,
    `ftpW` INTEGER NULL,
    `sweatRateLPerH` DECIMAL(4, 2) NULL,
    `sweatRateSource` VARCHAR(191) NULL,
    `ghTolerance` INTEGER NULL,
    `maxHr` INTEGER NULL,
    `hrZones` JSON NULL,
    `age` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `heightCm` INTEGER NULL,
    `fieldSources` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhysicalDataConflict` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `manualValue` JSON NOT NULL,
    `syncedValue` JSON NOT NULL,
    `provider` ENUM('TRAININGPEAKS', 'GARMIN', 'STRAVA') NOT NULL,
    `resolvedWith` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderConnection` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` ENUM('TRAININGPEAKS', 'GARMIN', 'STRAVA') NOT NULL,
    `externalUserId` VARCHAR(191) NOT NULL,
    `accessTokenEnc` TEXT NOT NULL,
    `refreshTokenEnc` TEXT NULL,
    `expiresAt` DATETIME(3) NULL,
    `scopes` VARCHAR(191) NULL,
    `status` ENUM('CONNECTED', 'DISCONNECTED', 'REVOKED') NOT NULL DEFAULT 'CONNECTED',
    `webhookSubscriptionId` VARCHAR(191) NULL,
    `lastSyncAt` DATETIME(3) NULL,

    UNIQUE INDEX `ProviderConnection_userId_provider_key`(`userId`, `provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('TRAININGPEAKS', 'GARMIN', 'STRAVA') NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,

    UNIQUE INDEX `WebhookEvent_provider_externalId_eventType_key`(`provider`, `externalId`, `eventType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('BETA_ALL_ACCESS') NOT NULL DEFAULT 'BETA_ALL_ACCESS',

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Container` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('BOTTLE', 'SOFT_FLASK', 'BLADDER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `colorHex` VARCHAR(191) NULL,
    `capacityMl` INTEGER NOT NULL,
    `usualContent` ENUM('WATER', 'ISOTONIC', 'GEL_CONCENTRATE') NOT NULL DEFAULT 'WATER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContainerCalibration` (
    `id` VARCHAR(191) NOT NULL,
    `containerId` VARCHAR(191) NOT NULL,
    `weightsG` JSON NOT NULL,
    `mlPerSip` DECIMAL(5, 2) NULL,
    `gPerSqueeze` DECIMAL(5, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validationsLeft` INTEGER NOT NULL DEFAULT 4,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('DRINK_MIX', 'GEL', 'SOLID') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `servingG` DECIMAL(6, 2) NULL,
    `scoopG` DECIMAL(6, 2) NULL,
    `carbsG` DECIMAL(6, 2) NOT NULL,
    `sodiumMg` INTEGER NULL,
    `caffeineMg` INTEGER NULL,
    `label` JSON NULL,
    `favorite` BOOLEAN NOT NULL DEFAULT false,
    `source` ENUM('SCAN', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fdcId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `carbsPer100g` DECIMAL(6, 2) NOT NULL,
    `proteinPer100g` DECIMAL(6, 2) NULL,
    `fatPer100g` DECIMAL(6, 2) NULL,
    `fiberPer100g` DECIMAL(6, 2) NULL,
    `sodiumMgPer100g` INTEGER NULL,
    `portionG` DECIMAL(6, 2) NULL,
    `portionLabel` VARCHAR(191) NULL,
    `fodmap` ENUM('LOW', 'HIGH') NULL,

    UNIQUE INDEX `FoodItem_fdcId_key`(`fdcId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workout` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `source` ENUM('MANUAL', 'TRAININGPEAKS', 'GARMIN', 'STRAVA') NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `sport` ENUM('CYCLING', 'RUNNING', 'TRAIL_RUNNING', 'OTHER') NOT NULL,
    `kind` ENUM('STANDARD', 'SWEAT_TEST') NOT NULL DEFAULT 'STANDARD',
    `workoutType` ENUM('BASE', 'THRESHOLD', 'VO2MAX', 'ANAEROBIC', 'RECOVERY') NULL,
    `name` VARCHAR(191) NOT NULL,
    `plannedStart` DATETIME(3) NULL,
    `plannedDate` DATE NOT NULL,
    `durationMin` INTEGER NULL,
    `structure` JSON NULL,
    `status` ENUM('PLANNED', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'PLANNED',
    `sourceUpdatedAt` DATETIME(3) NULL,
    `stageId` VARCHAR(191) NULL,

    UNIQUE INDEX `Workout_stageId_key`(`stageId`),
    INDEX `Workout_userId_plannedDate_idx`(`userId`, `plannedDate`),
    UNIQUE INDEX `Workout_source_externalId_key`(`source`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Activity` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` ENUM('TRAININGPEAKS', 'GARMIN', 'STRAVA') NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `workoutId` VARCHAR(191) NULL,
    `startAt` DATETIME(3) NOT NULL,
    `durationMin` INTEGER NOT NULL,
    `summary` JSON NULL,
    `dedupeGroup` VARCHAR(191) NULL,

    UNIQUE INDEX `Activity_workoutId_key`(`workoutId`),
    UNIQUE INDEX `Activity_provider_externalId_key`(`provider`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FuelingPlan` (
    `id` VARCHAR(191) NOT NULL,
    `workoutId` VARCHAR(191) NOT NULL,
    `engineVersion` VARCHAR(191) NOT NULL,
    `targetGPerH` INTEGER NULL,
    `totalCarbsG` INTEGER NOT NULL,
    `totalFluidMl` INTEGER NOT NULL,
    `totalSodiumMg` INTEGER NOT NULL,
    `schedule` JSON NOT NULL,
    `carryList` JSON NOT NULL,
    `userAdjusted` BOOLEAN NOT NULL DEFAULT false,
    `isCurrent` BOOLEAN NOT NULL DEFAULT true,
    `weather` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostWorkoutLog` (
    `id` VARCHAR(191) NOT NULL,
    `workoutId` VARCHAR(191) NOT NULL,
    `intakeCarbsG` INTEGER NULL,
    `intakeItems` JSON NULL,
    `intakeTiming` JSON NULL,
    `fluidMl` INTEGER NULL,
    `symptomUpper` ENUM('NONE', 'MILD', 'MODERATE', 'SEVERE') NULL,
    `symptomLower` ENUM('NONE', 'MILD', 'MODERATE', 'SEVERE') NULL,
    `symptomSystemic` ENUM('NONE', 'MILD', 'MODERATE', 'SEVERE') NULL,
    `feeling` VARCHAR(191) NULL,
    `containerWeighIns` JSON NULL,
    `followedPrompts` BOOLEAN NULL,
    `sipProposal` JSON NULL,
    `sweatPostWeightKg` DECIMAL(5, 2) NULL,
    `countsForPlan` BOOLEAN NOT NULL DEFAULT true,
    `ladderEligible` BOOLEAN NOT NULL DEFAULT true,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PostWorkoutLog_workoutId_key`(`workoutId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SweatTest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `workoutId` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'AWAITING_DATA', 'COMPLETED', 'RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
    `scheduledFor` DATE NOT NULL,
    `movedFrom` DATE NULL,
    `preWeightKg` DECIMAL(5, 2) NULL,
    `postWeightKg` DECIMAL(5, 2) NULL,
    `fluidMl` INTEGER NULL,
    `urineMl` INTEGER NULL,
    `startedAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,
    `temperatureC` DECIMAL(4, 1) NULL,
    `humidityPct` INTEGER NULL,
    `sweatRateLPerH` DECIMAL(4, 2) NULL,

    UNIQUE INDEX `SweatTest_workoutId_key`(`workoutId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GutTrainingPlan` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `targetKind` ENUM('RACE', 'DATE') NOT NULL,
    `raceId` VARCHAR(191) NULL,
    `targetDate` DATE NOT NULL,
    `startGh` INTEGER NOT NULL,
    `goalGh` INTEGER NOT NULL,
    `defaultGh` INTEGER NULL,
    `tooFast` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ACTIVE', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `engineVersion` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LadderStep` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `index` INTEGER NOT NULL,
    `gh` INTEGER NOT NULL,
    `approxDate` DATE NULL,
    `status` ENUM('DONE', 'CURRENT', 'UPCOMING') NOT NULL DEFAULT 'UPCOMING',

    UNIQUE INDEX `LadderStep_planId_index_key`(`planId`, `index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdaptationDecision` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `outcome` ENUM('ADVANCE', 'HOLD', 'STEP_BACK') NOT NULL,
    `fromGh` INTEGER NOT NULL,
    `toGh` INTEGER NOT NULL,
    `inputLogIds` JSON NOT NULL,
    `reason` VARCHAR(191) NULL,
    `engineVersion` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Achievement` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('GH_INCREASE') NOT NULL DEFAULT 'GH_INCREASE',
    `valueGh` INTEGER NOT NULL,
    `workoutId` VARCHAR(191) NULL,
    `achievedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `celebratedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Race` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `startAt` DATETIME(3) NULL,
    `estimatedDurationMin` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `distanceKm` DECIMAL(7, 2) NULL,
    `elevationGainM` INTEGER NULL,
    `carbLoading` ENUM('NONE', 'TWO_DAY', 'ONE_DAY') NOT NULL DEFAULT 'NONE',
    `isMultiStage` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stage` (
    `id` VARCHAR(191) NOT NULL,
    `raceId` VARCHAR(191) NOT NULL,
    `index` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `estimatedDurationMin` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `distanceKm` DECIMAL(7, 2) NULL,
    `elevationGainM` INTEGER NULL,
    `activityId` VARCHAR(191) NULL,
    `arrivalAt` DATETIME(3) NULL,
    `arrivalSource` ENUM('PLATFORM_WEBHOOK', 'FALLBACK_TIMER') NULL,

    UNIQUE INDEX `Stage_raceId_index_key`(`raceId`, `index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AidStation` (
    `id` VARCHAR(191) NOT NULL,
    `raceId` VARCHAR(191) NULL,
    `stageId` VARCHAR(191) NULL,
    `kmMark` DECIMAL(7, 2) NOT NULL,
    `hasWater` BOOLEAN NOT NULL DEFAULT false,
    `hasIsotonic` BOOLEAN NOT NULL DEFAULT false,
    `hasGels` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaceStrategy` (
    `id` VARCHAR(191) NOT NULL,
    `raceId` VARCHAR(191) NOT NULL,
    `refillPoints` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `carryList` JSON NOT NULL,
    `chosen` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CarbLoadingDay` (
    `id` VARCHAR(191) NOT NULL,
    `raceId` VARCHAR(191) NOT NULL,
    `day` ENUM('D_MINUS_2', 'D_MINUS_1') NOT NULL,
    `date` DATE NOT NULL,
    `gPerKg` DECIMAL(4, 1) NOT NULL,
    `targetCarbsG` INTEGER NOT NULL,
    `meals` JSON NOT NULL,
    `isRehearsal` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `CarbLoadingDay_raceId_day_isRehearsal_key`(`raceId`, `day`, `isRehearsal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoadingRehearsal` (
    `id` VARCHAR(191) NOT NULL,
    `raceId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `longRideWorkoutId` VARCHAR(191) NULL,
    `status` ENUM('SUGGESTED', 'DISMISSED', 'DONE') NOT NULL DEFAULT 'SUGGESTED',
    `dismissedAt` DATETIME(3) NULL,

    UNIQUE INDEX `LoadingRehearsal_raceId_key`(`raceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StageRecoveryPlan` (
    `id` VARCHAR(191) NOT NULL,
    `stageId` VARCHAR(191) NOT NULL,
    `gapCase` ENUM('UNDER_4H', 'H4_TO_12H', 'OVERNIGHT', 'REST_DAY') NOT NULL,
    `gapMin` INTEGER NULL,
    `carbsTargetG` INTEGER NOT NULL,
    `proteinTargetG` INTEGER NULL,
    `fluidTargetMl` INTEGER NULL,
    `sodiumTargetMg` INTEGER NULL,
    `sensitiveStomach` BOOLEAN NOT NULL DEFAULT false,
    `meals` JSON NOT NULL,
    `engineVersion` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `StageRecoveryPlan_stageId_key`(`stageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TodoItem` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('LAST_SESSION_FEEDBACK', 'SIP_CALIBRATION', 'SIP_VALIDATION', 'SWEAT_TEST', 'COMPLETE_PROFILE', 'ADD_BOTTLE', 'ADD_RACE', 'CONNECT_CALENDAR', 'PRE_RACE_STRATEGY', 'DATA_CONFLICT', 'ESTIMATE_GH', 'LOADING_REHEARSAL') NOT NULL,
    `tier` ENUM('HIGHEST', 'CALIBRATION', 'LOWER') NOT NULL,
    `refType` VARCHAR(191) NULL,
    `refId` VARCHAR(191) NULL,
    `payload` JSON NULL,
    `status` ENUM('OPEN', 'DONE', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `closedAt` DATETIME(3) NULL,

    INDEX `TodoItem_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('DAILY_BRIEFING', 'POST_WORKOUT', 'POST_WORKOUT_REMINDER', 'SWEAT_TEST_NIGHT_BEFORE', 'SWEAT_TEST_DAY', 'SWEAT_TEST_END', 'SWEAT_TEST_INCOMPLETE', 'SWEAT_TEST_QUARTERLY', 'CARB_LOADING_D2', 'CARB_LOADING_D1', 'RACE_BREAKFAST', 'LOADING_REHEARSAL', 'STAGE_COMPLETE') NOT NULL,
    `channel` ENUM('APNS', 'IN_APP') NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `sentAt` DATETIME(3) NULL,
    `readAt` DATETIME(3) NULL,
    `copyKey` VARCHAR(191) NOT NULL,
    `deepLink` VARCHAR(191) NULL,
    `refType` VARCHAR(191) NULL,
    `refId` VARCHAR(191) NULL,
    `dedupeKey` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'SENT', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'SCHEDULED',

    UNIQUE INDEX `Notification_dedupeKey_key`(`dedupeKey`),
    INDEX `Notification_status_scheduledAt_idx`(`status`, `scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuthIdentity` ADD CONSTRAINT `AuthIdentity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnboardingAnswers` ADD CONSTRAINT `OnboardingAnswers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhysicalData` ADD CONSTRAINT `PhysicalData_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhysicalDataConflict` ADD CONSTRAINT `PhysicalDataConflict_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderConnection` ADD CONSTRAINT `ProviderConnection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Container` ADD CONSTRAINT `Container_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContainerCalibration` ADD CONSTRAINT `ContainerCalibration_containerId_fkey` FOREIGN KEY (`containerId`) REFERENCES `Container`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workout` ADD CONSTRAINT `Workout_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workout` ADD CONSTRAINT `Workout_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `Workout`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FuelingPlan` ADD CONSTRAINT `FuelingPlan_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `Workout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostWorkoutLog` ADD CONSTRAINT `PostWorkoutLog_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `Workout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SweatTest` ADD CONSTRAINT `SweatTest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SweatTest` ADD CONSTRAINT `SweatTest_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `Workout`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GutTrainingPlan` ADD CONSTRAINT `GutTrainingPlan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GutTrainingPlan` ADD CONSTRAINT `GutTrainingPlan_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LadderStep` ADD CONSTRAINT `LadderStep_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `GutTrainingPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdaptationDecision` ADD CONSTRAINT `AdaptationDecision_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `GutTrainingPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Achievement` ADD CONSTRAINT `Achievement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Race` ADD CONSTRAINT `Race_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stage` ADD CONSTRAINT `Stage_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AidStation` ADD CONSTRAINT `AidStation_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AidStation` ADD CONSTRAINT `AidStation_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaceStrategy` ADD CONSTRAINT `RaceStrategy_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CarbLoadingDay` ADD CONSTRAINT `CarbLoadingDay_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoadingRehearsal` ADD CONSTRAINT `LoadingRehearsal_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `Race`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StageRecoveryPlan` ADD CONSTRAINT `StageRecoveryPlan_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodoItem` ADD CONSTRAINT `TodoItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
