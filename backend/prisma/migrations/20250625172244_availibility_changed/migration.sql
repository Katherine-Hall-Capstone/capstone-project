/*
  Warnings:

  - You are about to drop the column `userId` on the `Availibility` table. All the data in the column will be lost.
  - Added the required column `providerId` to the `Availibility` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Availibility" DROP CONSTRAINT "Availibility_userId_fkey";

-- AlterTable
ALTER TABLE "Availibility" DROP COLUMN "userId",
ADD COLUMN     "providerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Availibility" ADD CONSTRAINT "Availibility_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
