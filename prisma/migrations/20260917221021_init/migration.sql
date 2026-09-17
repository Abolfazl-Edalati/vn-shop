-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ESCROW_HOLD', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'USDT', 'WALLET');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('WALLET', 'CARD', 'USDT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "steamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '',
    "trade_url" TEXT,
    "email" TEXT,
    "wallet" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trade_url" TEXT NOT NULL,
    "email" TEXT,
    "payment_method" "PaymentMethod" NOT NULL,
    "escrow_step" INTEGER NOT NULL DEFAULT 0,
    "total_usd" DECIMAL(12,2) NOT NULL,
    "total_toman" DECIMAL(20,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_lines" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "skin_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wear" TEXT,
    "float" DOUBLE PRECISION,
    "price_usd" DECIMAL(12,2) NOT NULL,
    "price_toman" DECIMAL(20,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payout_method" "PayoutMethod" NOT NULL,
    "payout_dest" TEXT,
    "rate" DECIMAL(5,4) NOT NULL,
    "items_value_usd" DECIMAL(12,2) NOT NULL,
    "items_value_toman" DECIMAL(20,2) NOT NULL,
    "payout_usd" DECIMAL(12,2) NOT NULL,
    "payout_toman" DECIMAL(20,2) NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sell_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_order_lines" (
    "id" TEXT NOT NULL,
    "sell_order_id" TEXT NOT NULL,
    "skin_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wear" TEXT,
    "float" DOUBLE PRECISION,
    "price_usd" DECIMAL(12,2) NOT NULL,
    "price_toman" DECIMAL(20,2) NOT NULL,

    CONSTRAINT "sell_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_steamId_key" ON "users"("steamId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- CreateIndex
CREATE UNIQUE INDEX "sell_orders_number_key" ON "sell_orders"("number");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_orders" ADD CONSTRAINT "sell_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_order_lines" ADD CONSTRAINT "sell_order_lines_sell_order_id_fkey" FOREIGN KEY ("sell_order_id") REFERENCES "sell_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
