/*
  Warnings:

  - You are about to drop the column `age` on the `dogs` table. All the data in the column will be lost.
    (Safe: age is now computed from `dateOfBirth` in the application layer.)

*/
-- AlterTable
ALTER TABLE "dogs" DROP COLUMN "age";
