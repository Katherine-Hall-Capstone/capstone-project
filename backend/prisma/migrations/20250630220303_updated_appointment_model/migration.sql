/*
  Warnings:

  - The values [PENDING,REJECTED] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Availability` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('AVAILABLE', 'BOOKED', 'CANCELLED');
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "AppointmentStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_providerId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Availability";
