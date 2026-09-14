-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "location" TEXT,
    "photoUrl" TEXT,
    "qrToken" TEXT NOT NULL,
    "customerSelectable" BOOLEAN NOT NULL DEFAULT true,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Table_qrToken_key" ON "Table"("qrToken");

-- CreateIndex
CREATE INDEX "Table_organizationId_idx" ON "Table"("organizationId");

-- CreateIndex
CREATE INDEX "Table_branchId_idx" ON "Table"("branchId");

-- CreateIndex
CREATE INDEX "Table_branchId_status_idx" ON "Table"("branchId", "status");

-- CreateIndex
CREATE INDEX "Table_branchId_customerSelectable_idx" ON "Table"("branchId", "customerSelectable");

-- CreateIndex
CREATE UNIQUE INDEX "Table_branchId_name_key" ON "Table"("branchId", "name");

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
