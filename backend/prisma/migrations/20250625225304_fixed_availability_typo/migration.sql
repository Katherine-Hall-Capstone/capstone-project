/*
  Warnings:

  - You are about to drop the `Availibility` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Availibility" DROP CONSTRAINT "Availibility_providerId_fkey";

-- DropTable
DROP TABLE "Availibility";

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
