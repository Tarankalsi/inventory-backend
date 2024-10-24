/*
  Warnings:

  - Added the required column `gstTax` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "gstTax" DOUBLE PRECISION NOT NULL;
