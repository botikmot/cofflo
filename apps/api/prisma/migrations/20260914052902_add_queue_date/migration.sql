/*
  Warnings:

  - A unique constraint covering the columns `[branchId,queueDate,queueNumber]` on the table `QueueEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `queueDate` to the `QueueEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QueueEntry" ADD COLUMN     "queueDate" DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_branchId_queueDate_queueNumber_key" ON "QueueEntry"("branchId", "queueDate", "queueNumber");
