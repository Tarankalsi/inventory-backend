-- DropForeignKey
ALTER TABLE "itemImage" DROP CONSTRAINT "itemImage_itemId_fkey";

-- AddForeignKey
ALTER TABLE "itemImage" ADD CONSTRAINT "itemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;
