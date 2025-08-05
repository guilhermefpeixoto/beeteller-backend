import { z } from 'zod';


const createParticipantSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  cpfCnpj: z.union([
    z.string().length(11),
    z.string().length(14),
  ]),
  ispb: z.string().length(8),
  branchCode: z.string().length(4),
  accountNumber: z.string().max(10),
  accountType: z.string().length(4),
});

const createPixMessageSchema = z.object({
  id: z.uuidv4(),
  endToEndId: z.string().length(32),
  amount: z.bigint(),
  payerId: z.uuidv4(),
  receiverId: z.uuidv4(),
  receiverIspb: z.string().length(8),
  txId: z.uuidv4(),
  paidAt: z.date(),
});

export type CreateParticipantType = z.infer<typeof createParticipantSchema>;
export type CreatePixMessageType = z.infer<typeof createPixMessageSchema>;