/*
  Warnings:

  - Added the required column `country` to the `OrderAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderAddress" ADD COLUMN     "country" TEXT NOT NULL;
