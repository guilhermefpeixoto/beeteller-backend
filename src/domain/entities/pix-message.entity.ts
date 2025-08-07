import { Participant } from "./participant.entity";

export interface PixMessage {
  id: string;
  endToEndId: string;
  amount: BigInt;
  payerId: string;
  payer?: Participant;
  receiverId: string;
  receiver?: Participant;
  receiverIspb: string;
  freeText?: string;
  txId: string;
  paidAt: Date
}