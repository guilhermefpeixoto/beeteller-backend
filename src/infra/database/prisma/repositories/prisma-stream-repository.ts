import { Stream, StreamPull } from "@prisma/client";
import prisma from "..";
import { ICreateStreamPayload, ICreateStreamPullPayload, IStreamPull, IStreamRepository } from "@/domain/repositories/stream.repository.interface";


export class PrismaStreamRepository implements IStreamRepository {
  async createStream(payload: ICreateStreamPayload): Promise<void> {
    await prisma.stream.create({
      data: payload,
    });
  }

  async createStreamPull(payload: ICreateStreamPullPayload): Promise<void> {
    await prisma.streamPull.create({
      data: payload,
    });
  }

  async findByIterationId(iterationId: StreamPull['iterationId']): Promise<IStreamPull | null> {
    const streamPull = await prisma.streamPull.findUnique({
      where: {
        iterationId: iterationId,
      },
      select: {
        id: true,
        streamId: true,
        status: true,
        stream: {
          select: {
            ispb: true,
          },
        },
      },
    });

    return streamPull;
  }

  async countByIspb(ispb: Stream['ispb']): Promise<number> {
    const countByIspb = await prisma.stream.count({
      where: {
        ispb: ispb,
      }
    });

    return countByIspb;
  }

  async updateStreamPullStatusById(id: StreamPull['id']): Promise<string> {
    const data = await prisma.streamPull.update({
      where: {
        id: id,
      },
      data: {
        status: 'CLOSED',
      },
      select: {
        streamId: true
      }
    });

    return data.streamId;
  }

  async deleteByIterationId(iterationId: StreamPull['iterationId']): Promise<void> {
    await prisma.stream.deleteMany({
      where: {
        streamPulls: {
          some: {
            iterationId: iterationId,
          },
        },
      },
    });
  }
}