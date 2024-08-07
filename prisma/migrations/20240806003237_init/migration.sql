-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "idUser" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isGoogleUser" BOOLEAN NOT NULL DEFAULT false,
    "userNickName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "roles" TEXT[] DEFAULT ARRAY['user']::TEXT[],
    "lastLogin" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL DEFAULT 'SYSTEM',
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "UserAddress" (
    "idUserAddress" TEXT NOT NULL,
    "streetName" TEXT NOT NULL,
    "exteriorNumber" INTEGER NOT NULL,
    "interiorNumber" INTEGER,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "userIdUser" TEXT,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("idUserAddress")
);

-- CreateTable
CREATE TABLE "FavoriteProducts" (
    "idFavorites" SERIAL NOT NULL,
    "listName" TEXT NOT NULL DEFAULT 'Favorites',
    "productsList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userIdUser" TEXT NOT NULL,

    CONSTRAINT "FavoriteProducts_pkey" PRIMARY KEY ("idFavorites")
);

-- CreateTable
CREATE TABLE "ShoppingCart" (
    "idCart" SERIAL NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "userIdUser" TEXT NOT NULL,

    CONSTRAINT "ShoppingCart_pkey" PRIMARY KEY ("idCart")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteProducts_userIdUser_key" ON "FavoriteProducts"("userIdUser");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingCart_userIdUser_key" ON "ShoppingCart"("userIdUser");

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userIdUser_fkey" FOREIGN KEY ("userIdUser") REFERENCES "User"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteProducts" ADD CONSTRAINT "FavoriteProducts_userIdUser_fkey" FOREIGN KEY ("userIdUser") REFERENCES "User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_userIdUser_fkey" FOREIGN KEY ("userIdUser") REFERENCES "User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;
