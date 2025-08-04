/*
  Warnings:

  - You are about to drop the `participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pix_messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."pix_messages" DROP CONSTRAINT "pix_messages_payerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."pix_messages" DROP CONSTRAINT "pix_messages_receiverId_fkey";

-- DropTable
DROP TABLE "public"."participants";

-- DropTable
DROP TABLE "public"."pix_messages";

-- CreateTable
CREATE TABLE "public"."pix_message" (
    "id" TEXT NOT NULL,
    "endToEndId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL DEFAULT 0,
    "payerId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "receiverIsbp" VARCHAR(8) NOT NULL,
    "freeText" TEXT,
    "txId" TEXT NOT NULL,
    "paidAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pix_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpfCnpj" VARCHAR(14) NOT NULL,
    "ispb" VARCHAR(8) NOT NULL,
    "branchCode" VARCHAR(4) NOT NULL,
    "accountNumber" VARCHAR(10) NOT NULL,
    "accountType" VARCHAR(4) NOT NULL,

    CONSTRAINT "participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pix_message_endToEndId_key" ON "public"."pix_message"("endToEndId");

-- CreateIndex
CREATE UNIQUE INDEX "pix_message_txId_key" ON "public"."pix_message"("txId");

-- CreateIndex
CREATE INDEX "pix_message_receiverIsbp_idx" ON "public"."pix_message"("receiverIsbp");

-- CreateIndex
CREATE UNIQUE INDEX "participant_ispb_branchCode_accountNumber_key" ON "public"."participant"("ispb", "branchCode", "accountNumber");

-- AddForeignKey
ALTER TABLE "public"."pix_message" ADD CONSTRAINT "pix_message_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "public"."participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pix_message" ADD CONSTRAINT "pix_message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
