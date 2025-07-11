-- CreateTable
CREATE TABLE "ClientPreferences" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "ClientPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderPreferences" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "maxConsecutiveHours" INTEGER NOT NULL,
    "prefersEarly" BOOLEAN NOT NULL,

    CONSTRAINT "ProviderPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProviderPreferences_providerId_key" ON "ProviderPreferences"("providerId");

-- AddForeignKey
ALTER TABLE "ClientPreferences" ADD CONSTRAINT "ClientPreferences_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPreferences" ADD CONSTRAINT "ProviderPreferences_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
