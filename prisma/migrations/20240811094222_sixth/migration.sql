/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ProductCatalog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[categoryName]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductCatalog" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalog_slug_key" ON "ProductCatalog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_categoryName_key" ON "ProductCategory"("categoryName");
