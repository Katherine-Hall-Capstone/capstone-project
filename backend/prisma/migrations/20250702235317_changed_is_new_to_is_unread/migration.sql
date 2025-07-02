/*
  Warnings:

  - You are about to drop the column `isNew` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "isNew",
ADD COLUMN     "isUnread" BOOLEAN NOT NULL DEFAULT true;
