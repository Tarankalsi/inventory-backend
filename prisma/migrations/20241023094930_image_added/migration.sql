-- CreateTable
CREATE TABLE "itemImage" (
    "imageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itemImage_pkey" PRIMARY KEY ("imageId")
);

-- AddForeignKey
ALTER TABLE "itemImage" ADD CONSTRAINT "itemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("itemId") ON DELETE RESTRICT ON UPDATE CASCADE;
