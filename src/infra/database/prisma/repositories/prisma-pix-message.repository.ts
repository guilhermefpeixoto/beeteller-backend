import { ICreateManyPixMessagesPayload, IPixMessageRepository, IPixMessageWithParticipants } from "@/domain/repositories/pix-message.repository.interface";
import prisma from "..";
import { PixMessage } from "@/domain/entities/pix-message.entity";


export class PrismaPixMessageRepository implements IPixMessageRepository {
  async createMany(payload: ICreateManyPixMessagesPayload): Promise<void> {
    const { participants, pixMessages } = payload;

    try {
      await prisma.$transaction([
        prisma.participant.createMany({
          data: participants,
          skipDuplicates: true,
        }),

        prisma.pixMessage.createMany({
          data: pixMessages,
        }),
      ]);
    } catch (err) {
      throw new Error("Error processing transactions in the database.")
    }
  }

  async findPixMessagesByIspb(ispb: PixMessage['receiverIspb'],
    limit: number): Promise<IPixMessageWithParticipants[]> {
    const lockedPixMessages = await prisma.$transaction(async (tx) => {
      const pixMessagestoLock = await tx.$queryRaw <{ id: string }[]> `
      SELECT "id" FROM "pix_message"
      WHERE "receiverIspb" = ${ispb} AND "isRead" = false
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
      `;

      if (pixMessagestoLock.length == 0) {
        return [];
      }

      const pixMessagesToLockIds = pixMessagestoLock.map((pixMessage) => pixMessage.id);

      await tx.pixMessage.updateMany({
        where: {
          id: {
            in: pixMessagesToLockIds
          },
        },
        data: {
          isRead: true,
        },
      });

      const pixMessages = await tx.pixMessage.findMany({
        where: {
          id: {
            in: pixMessagesToLockIds,
          },
        },
        include: {
          payer: {
            omit: {
              id: true,
            },
          },
          receiver: {
            omit: {
              id: true,
            },
          },
        },
        omit: {
          id: true,
          payerId: true,
          receiverId: true,
          receiverIspb: true,
        },
      });

      return pixMessages;
    });

    return lockedPixMessages;
  }
}