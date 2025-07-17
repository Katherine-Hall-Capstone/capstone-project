/*
  Warnings:

  - You are about to drop the column `googleEventId` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "googleEventId",
ADD COLUMN     "clientGoogleEventId" TEXT,
ADD COLUMN     "providerGoogleEventId" TEXT;
