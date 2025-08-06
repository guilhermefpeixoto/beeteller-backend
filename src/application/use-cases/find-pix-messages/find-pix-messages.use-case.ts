import { IPixMessageRepository, IPixMessageWithParticipants } from "@/domain/repositories/pix-message.repository.interface";


export class FindPixMessagesByIspbUseCase {
  constructor(private pixMessageRepository: IPixMessageRepository) { }

  async execute(ispb: string): Promise<IPixMessageWithParticipants[]> {
    const pixMessages = await this.pixMessageRepository.findPixMessagesByIspb(ispb);

    return pixMessages;
  }
}