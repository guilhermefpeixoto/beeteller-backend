-- DropForeignKey
ALTER TABLE "public"."stream_pull" DROP CONSTRAINT "stream_pull_streamId_fkey";

-- AddForeignKey
ALTER TABLE "public"."stream_pull" ADD CONSTRAINT "stream_pull_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "public"."stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
