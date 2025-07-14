/*
  Warnings:

  - You are about to drop the column `dateTime` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `startDateTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "dateTime",
ADD COLUMN     "startDateTime" TIMESTAMP(3) NOT NULL;
