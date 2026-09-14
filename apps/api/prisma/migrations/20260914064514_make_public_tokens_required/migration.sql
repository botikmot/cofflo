/*
  Warnings:

  - Made the column `publicToken` on table `QueueEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publicToken` on table `Reservation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "QueueEntry" ALTER COLUMN "publicToken" SET NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "publicToken" SET NOT NULL;
