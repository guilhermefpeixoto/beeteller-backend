import { CreateManyPixMessagesPayload } from "@/domain/repositories/pix-message.repository.interface";
import { CreateParticipantType, CreatePixMessageType } from "@/domain/schemas/create-pix-messages.schema";
import { Faker, pt_BR } from "@faker-js/faker";


const faker = new Faker({ locale: [pt_BR] });

export function generatePixMessages(ispb: string, quantity: number): CreateManyPixMessagesPayload {
  if (quantity <= 0) {
    return { participants: [], pixMessages: [] };
  }

  const accountTypes = ['CACC', 'SLRY', 'SVGS'];

  const ispbList = ['00000000', '00360305', '60746948', '90400888', '60701190']

  const participants: CreateParticipantType[] = [];
  const pixMessages: CreatePixMessageType[] = [];

  for (let i = 0; i < quantity; i++) {
    const paidAt = new Date();

    const payer: CreateParticipantType = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      cpfCnpj: generateCpfOrCnpj(),
      ispb: faker.helpers.arrayElement(ispbList),
      branchCode: faker.string.numeric(4),
      accountNumber: faker.finance.accountNumber(),
      accountType: faker.helpers.arrayElement(accountTypes)
    };

    const receiver: CreateParticipantType = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      cpfCnpj: generateCpfOrCnpj(),
      ispb: ispb,
      branchCode: faker.string.numeric(4),
      accountNumber: faker.finance.accountNumber(),
      accountType: faker.helpers.arrayElement(accountTypes)
    };

    const pixMessage: CreatePixMessageType = {
      id: faker.string.uuid(),
      endToEndId: `E${payer.ispb}${formatEndToEndIdDate(paidAt)}${faker.string.alphanumeric(15)}`.toUpperCase(),
      amount: BigInt(faker.number.int({ min: 100, max: 1000000 })),
      payerId: payer.id,
      receiverId: receiver.id,
      receiverIspb: receiver.ispb,
      txId: faker.string.uuid(),
      paidAt: paidAt,
    };

    participants.push(payer, receiver);
    pixMessages.push(pixMessage);
  }

  return { participants, pixMessages };
}

function generateCpfOrCnpj(): string {
  if (faker.datatype.boolean()) {
    return faker.string.numeric(11);
  } else {
    return faker.string.numeric(14);
  }
}

function formatEndToEndIdDate(date: Date): string {
  return date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
}