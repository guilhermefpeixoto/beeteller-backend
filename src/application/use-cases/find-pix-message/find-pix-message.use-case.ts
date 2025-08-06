import { IPixMessageRepository, IPixMessageWithParticipants } from "@/domain/repositories/pix-message.repository.interface";


export class FindPixMessageByIspbUseCase {
  constructor(private pixMessageRepository: IPixMessageRepository) { }

  async execute(ispb: string): Promise<IPixMessageWithParticipants | null> {
    const pixMessages = await this.pixMessageRepository.findPixMessageByIspb(ispb);

    return pixMessages;
  }
}