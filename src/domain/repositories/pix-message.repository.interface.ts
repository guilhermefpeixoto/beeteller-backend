export interface ICreateManyPixMessagesPayload {
  participants: ICreateParticipantPayload[];
  pixMessages: ICreatePixMessagePayload[];
};

export interface ICreateParticipantPayload {
  id: string,
  name: string,
  cpfCnpj: string,
  ispb: string,
  branchCode: string,
  accountNumber: string,
  accountType: string,
}

export interface IParticipant {
  name: string,
  cpfCnpj: string,
  ispb: string,
  branchCode: string,
  accountNumber: string,
  accountType: string,
}

export interface ICreatePixMessagePayload {
  id: string
  endToEndId: string
  amount: bigint,
  payerId: string,
  receiverId: string,
  receiverIspb: string,
  freeText?: string,
  txId: string,
  paidAt: Date,
}

export interface IPixMessageWithParticipants {
  endToEndId: string,
  amount: bigint,
  payer: IParticipant,
  receiver: IParticipant,
  freeText: string | null,
  txId: string,
  paidAt: Date,
}


export interface IPixMessageRepository {
  createMany(payload: ICreateManyPixMessagesPayload): Promise<void>;
  findPixMessageByIspb(ispb: string): Promise<IPixMessageWithParticipants | null>;
  findPixMessagesByIspb(ispb: string): Promise<IPixMessageWithParticipants[]>;
}