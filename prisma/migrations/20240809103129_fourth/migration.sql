-- CreateTable
CREATE TABLE "Order" (
    "idOrder" TEXT NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "discountApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cuponUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userIdUser" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("idOrder")
);

-- CreateTable
CREATE TABLE "OrderReceipt" (
    "idOrderReceipt" TEXT NOT NULL,
    "receiptUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderIdOrder" TEXT NOT NULL,

    CONSTRAINT "OrderReceipt_pkey" PRIMARY KEY ("idOrderReceipt")
);

-- CreateTable
CREATE TABLE "OrderAddress" (
    "idOrderAddress" TEXT NOT NULL,
    "streetName" TEXT NOT NULL,
    "exteriorNumber" INTEGER NOT NULL,
    "interiorNumber" INTEGER,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "orderIdOrder" TEXT NOT NULL,

    CONSTRAINT "OrderAddress_pkey" PRIMARY KEY ("idOrderAddress")
);

-- CreateTable
CREATE TABLE "ShoppingCartDetails" (
    "idShoppingCartDetails" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "shoppingCartIdCart" INTEGER,
    "productCatalogIdProduct" TEXT,

    CONSTRAINT "ShoppingCartDetails_pkey" PRIMARY KEY ("idShoppingCartDetails")
);

-- CreateTable
CREATE TABLE "OrderDetails" (
    "idOrderDetail" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "orderIdOrder" TEXT,
    "productCatalogIdProduct" TEXT,

    CONSTRAINT "OrderDetails_pkey" PRIMARY KEY ("idOrderDetail")
);

-- CreateTable
CREATE TABLE "ProductCatalog" (
    "idProduct" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "stockQuantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "tags" TEXT[],
    "slug" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productCategoryIdCategory" INTEGER,

    CONSTRAINT "ProductCatalog_pkey" PRIMARY KEY ("idProduct")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "idCategory" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("idCategory")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "idProductImage" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "productCatalogIdProduct" TEXT,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("idProductImage")
);

-- CreateTable
CREATE TABLE "ProductRating" (
    "idProductRating" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productCatalogIdProduct" TEXT,

    CONSTRAINT "ProductRating_pkey" PRIMARY KEY ("idProductRating")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderReceipt_orderIdOrder_key" ON "OrderReceipt"("orderIdOrder");

-- CreateIndex
CREATE UNIQUE INDEX "OrderAddress_orderIdOrder_key" ON "OrderAddress"("orderIdOrder");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userIdUser_fkey" FOREIGN KEY ("userIdUser") REFERENCES "User"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReceipt" ADD CONSTRAINT "OrderReceipt_orderIdOrder_fkey" FOREIGN KEY ("orderIdOrder") REFERENCES "Order"("idOrder") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAddress" ADD CONSTRAINT "OrderAddress_orderIdOrder_fkey" FOREIGN KEY ("orderIdOrder") REFERENCES "Order"("idOrder") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCartDetails" ADD CONSTRAINT "ShoppingCartDetails_shoppingCartIdCart_fkey" FOREIGN KEY ("shoppingCartIdCart") REFERENCES "ShoppingCart"("idCart") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCartDetails" ADD CONSTRAINT "ShoppingCartDetails_productCatalogIdProduct_fkey" FOREIGN KEY ("productCatalogIdProduct") REFERENCES "ProductCatalog"("idProduct") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_orderIdOrder_fkey" FOREIGN KEY ("orderIdOrder") REFERENCES "Order"("idOrder") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_productCatalogIdProduct_fkey" FOREIGN KEY ("productCatalogIdProduct") REFERENCES "ProductCatalog"("idProduct") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalog" ADD CONSTRAINT "ProductCatalog_productCategoryIdCategory_fkey" FOREIGN KEY ("productCategoryIdCategory") REFERENCES "ProductCategory"("idCategory") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productCatalogIdProduct_fkey" FOREIGN KEY ("productCatalogIdProduct") REFERENCES "ProductCatalog"("idProduct") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRating" ADD CONSTRAINT "ProductRating_productCatalogIdProduct_fkey" FOREIGN KEY ("productCatalogIdProduct") REFERENCES "ProductCatalog"("idProduct") ON DELETE SET NULL ON UPDATE CASCADE;
