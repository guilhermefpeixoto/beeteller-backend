import { IParticipant } from "@/domain/repositories/pix-message.repository.interface";
import { ParticipantView } from "@/infra/views/participant.view";


export class ParticipantMapper {
  static toView(participant: IParticipant): ParticipantView {

    return {
      nome: participant.name,
      cpfCnpj: participant.cpfCnpj,
      ispb: participant.ispb,
      agencia: participant.branchCode,
      contaTransacional: participant.accountNumber,
      tipoConta: participant.accountType,
    };
  }
}