-- CreateTable
CREATE TABLE "public"."stream" (
    "id" TEXT NOT NULL,
    "ispb" TEXT NOT NULL,

    CONSTRAINT "stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stream_pull" (
    "id" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,

    CONSTRAINT "stream_pull_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."stream_pull" ADD CONSTRAINT "stream_pull_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "public"."stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
