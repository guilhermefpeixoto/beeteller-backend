/*
  Warnings:

  - You are about to drop the column `receiverIsbp` on the `pix_message` table. All the data in the column will be lost.
  - Added the required column `receiverIspb` to the `pix_message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."pix_message_receiverIsbp_idx";

-- AlterTable
ALTER TABLE "public"."pix_message" DROP COLUMN "receiverIsbp",
ADD COLUMN     "receiverIspb" VARCHAR(8) NOT NULL;

-- CreateIndex
CREATE INDEX "pix_message_receiverIspb_idx" ON "public"."pix_message"("receiverIspb");
