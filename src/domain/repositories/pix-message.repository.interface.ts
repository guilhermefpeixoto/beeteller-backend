export interface CreateManyPixMessagesPayload {
  participants: ICreateParticipant[];
  pixMessages: ICreatePixMessage[];
};

export interface ICreateParticipant {
  id: string,
  name: string,
  cpfCnpj: string,
  ispb: string,
  branchCode: string,
  accountNumber: string,
  accountType: string
}

export interface ICreatePixMessage {
  id: string
  endToEndId: string
  amount: bigint,
  payerId: string,
  receiverId: string,
  receiverIspb: string,
  txId: string,
  paidAt: Date,
}


export interface IPixMessageRepository {
  createMany(payload: CreateManyPixMessagesPayload): Promise<void>;
}