import { IPixMessageWithParticipants } from "@/domain/repositories/pix-message.repository.interface";
import { PixMessageView } from "@/infra/views/pix-message.view";
import { ParticipantMapper } from "./participant.mapper";


export class PixMessageMapper {
  static toView(pixMessage: IPixMessageWithParticipants): PixMessageView {
    const formattedAmount = (Number(pixMessage.amount) / 100).toFixed(2);
    const formattedPayer = ParticipantMapper.toView(pixMessage.payer)
    const formattedReceiver = ParticipantMapper.toView(pixMessage.receiver)
    const formattedFreeText = pixMessage.freeText ?? '';

    return {
      endToEndId: pixMessage.endToEndId,
      valor: formattedAmount,
      pagador: formattedPayer,
      recebedor: formattedReceiver,
      campoLivre: formattedFreeText,
      txId: pixMessage.txId,
      dataHoraPagamento: pixMessage.paidAt,
    };
  }
}