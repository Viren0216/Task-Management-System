-- DropIndex
DROP INDEX `RefreshToken_token_key` ON `refreshtoken`;

-- AlterTable
ALTER TABLE `refreshtoken` MODIFY `token` TEXT NOT NULL;

-- CreateIndex
CREATE INDEX `Project_ownerId_idx` ON `Project`(`ownerId`);

-- CreateIndex
CREATE INDEX `ProjectMember_projectId_role_idx` ON `ProjectMember`(`projectId`, `role`);
