/*
  Warnings:

  - You are about to drop the column `nome` on the `user` table. All the data in the column will be lost.
  - Added the required column `name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "githubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL
);
INSERT INTO "new_user" ("avatarUrl", "githubId", "id", "login") SELECT "avatarUrl", "githubId", "id", "login" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_githubId_key" ON "user"("githubId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
