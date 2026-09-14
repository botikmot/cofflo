-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEOUT');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'DINE_IN';

-- CreateIndex
CREATE INDEX "Order_branchId_orderType_idx" ON "Order"("branchId", "orderType");
