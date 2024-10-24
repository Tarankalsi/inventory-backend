/*
  Warnings:

  - Added the required column `quantityUnit` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "quantityUnit" TEXT NOT NULL;
