/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('STAFF', 'CUSTOMER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "publicToken" TEXT,
ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'STAFF',
ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");

-- CreateIndex
CREATE INDEX "Order_branchId_source_idx" ON "Order"("branchId", "source");
