-- CreateTable
CREATE TABLE "public"."pix_messages" (
    "id" TEXT NOT NULL,
    "endToEndId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL DEFAULT 0,
    "payerId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "receiverIsbp" VARCHAR(8) NOT NULL,
    "freeText" TEXT,
    "txId" TEXT NOT NULL,
    "paidAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pix_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpfCnpj" VARCHAR(14) NOT NULL,
    "ispb" VARCHAR(8) NOT NULL,
    "branchCode" VARCHAR(4) NOT NULL,
    "accountNumber" VARCHAR(10) NOT NULL,
    "accountType" VARCHAR(4) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pix_messages_endToEndId_key" ON "public"."pix_messages"("endToEndId");

-- CreateIndex
CREATE UNIQUE INDEX "pix_messages_txId_key" ON "public"."pix_messages"("txId");

-- CreateIndex
CREATE INDEX "pix_messages_receiverIsbp_idx" ON "public"."pix_messages"("receiverIsbp");

-- CreateIndex
CREATE UNIQUE INDEX "participants_ispb_branchCode_accountNumber_key" ON "public"."participants"("ispb", "branchCode", "accountNumber");

-- AddForeignKey
ALTER TABLE "public"."pix_messages" ADD CONSTRAINT "pix_messages_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "public"."participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pix_messages" ADD CONSTRAINT "pix_messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
