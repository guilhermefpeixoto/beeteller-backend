import { ParticipantView } from "./participant.view";

export interface PixMessageView {
  endToEndId: string,
  valor: string,
  pagador: ParticipantView,
  recebedor: ParticipantView,
  campoLivre: string | null,
  txId: string,
  dataHoraPagamento: Date,
}