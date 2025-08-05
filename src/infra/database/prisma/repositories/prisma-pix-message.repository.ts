import { CreateManyPixMessagesPayload, IPixMessageRepository } from "@/domain/repositories/pix-message.repository.interface";
import prisma from "..";


export class PrismaPixMessageRepository implements IPixMessageRepository {
  async createMany(payload: CreateManyPixMessagesPayload): Promise<void> {
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
}