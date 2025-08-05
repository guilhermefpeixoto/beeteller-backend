import { CreateParticipantType, CreatePixMessageType } from "../schemas/create-pix-messages.schema";


export type CreateManyPixMessagesPayload = {
  participants: CreateParticipantType[];
  pixMessages: CreatePixMessageType[];
};

export interface IPixMessageRepository {
  createMany(payload: CreateManyPixMessagesPayload): Promise<void>;
}