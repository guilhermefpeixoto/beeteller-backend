/*
  Warnings:

  - A unique constraint covering the columns `[streamId]` on the table `stream_pull` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[iterationId]` on the table `stream_pull` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `streamId` to the `stream_pull` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."StreamStatus" AS ENUM ('OPEN', 'CLOSED');

-- DropForeignKey
ALTER TABLE "public"."stream_pull" DROP CONSTRAINT "stream_pull_iterationId_fkey";

-- AlterTable
ALTER TABLE "public"."stream_pull" ADD COLUMN     "status" "public"."StreamStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "streamId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stream_pull_streamId_key" ON "public"."stream_pull"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "stream_pull_iterationId_key" ON "public"."stream_pull"("iterationId");

-- AddForeignKey
ALTER TABLE "public"."stream_pull" ADD CONSTRAINT "stream_pull_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "public"."stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
