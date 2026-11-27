-- Class packages. Run once in the Supabase SQL editor (this project has no Prisma migrations folder).
CREATE TABLE IF NOT EXISTS "PackagePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageSlug" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "credits" INTEGER,
    "pricePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PackagePurchase_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PackagePurchase_paymentId_key" ON "PackagePurchase"("paymentId");
CREATE INDEX IF NOT EXISTS "PackagePurchase_userId_idx" ON "PackagePurchase"("userId");
ALTER TABLE "PackagePurchase" DROP CONSTRAINT IF EXISTS "PackagePurchase_userId_fkey";
ALTER TABLE "PackagePurchase" ADD CONSTRAINT "PackagePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "packagePurchaseId" TEXT;
CREATE INDEX IF NOT EXISTS "Booking_packagePurchaseId_idx" ON "Booking"("packagePurchaseId");
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_packagePurchaseId_fkey";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packagePurchaseId_fkey" FOREIGN KEY ("packagePurchaseId") REFERENCES "PackagePurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
