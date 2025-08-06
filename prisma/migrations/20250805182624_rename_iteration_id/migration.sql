/*
  Warnings:

  - You are about to drop the column `streamId` on the `stream_pull` table. All the data in the column will be lost.
  - Added the required column `iterationId` to the `stream_pull` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."stream_pull" DROP CONSTRAINT "stream_pull_streamId_fkey";

-- AlterTable
ALTER TABLE "public"."stream_pull" DROP COLUMN "streamId",
ADD COLUMN     "iterationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."stream_pull" ADD CONSTRAINT "stream_pull_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "public"."stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
