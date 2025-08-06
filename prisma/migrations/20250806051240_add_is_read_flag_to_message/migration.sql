/*
  Warnings:

  - You are about to alter the column `ispb` on the `stream` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.

*/
-- DropIndex
DROP INDEX "public"."pix_message_receiverIspb_idx";

-- AlterTable
ALTER TABLE "public"."pix_message" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."stream" ALTER COLUMN "ispb" SET DATA TYPE VARCHAR(8);

-- CreateIndex
CREATE INDEX "pix_message_receiverIspb_isRead_idx" ON "public"."pix_message"("receiverIspb", "isRead");
