-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "acType" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "brand" TEXT,
    "tonnage" TEXT,
    "age" TEXT,
    "expectedPrice" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
