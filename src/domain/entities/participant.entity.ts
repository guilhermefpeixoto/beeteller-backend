import { PixMessage } from "./pix-message.entity";


export interface Participant {
  id: string;
  name: string;
  cpfCnpj: string;
  ispb: string;
  branchCode: string;
  accountNumber: string;
  accountType: string;
  payerPixMessages?: PixMessage[]
  receiverPixMessages?: PixMessage[]
}