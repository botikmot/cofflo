/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `QueueEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicToken]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "QueueEntry" ADD COLUMN     "publicToken" TEXT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "publicToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_publicToken_key" ON "QueueEntry"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_publicToken_key" ON "Reservation"("publicToken");
