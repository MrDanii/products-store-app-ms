-- AlterTable
ALTER TABLE "UserAddress" ALTER COLUMN "exteriorNumber" SET DATA TYPE TEXT,
ALTER COLUMN "interiorNumber" SET DATA TYPE TEXT,
ALTER COLUMN "neighborhood" DROP NOT NULL;
