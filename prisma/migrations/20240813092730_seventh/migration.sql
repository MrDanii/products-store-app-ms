/*
  Warnings:

  - A unique constraint covering the columns `[createdBy]` on the table `ProductRating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductRating_createdBy_key" ON "ProductRating"("createdBy");
