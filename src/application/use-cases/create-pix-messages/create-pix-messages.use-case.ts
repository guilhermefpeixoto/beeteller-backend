import { generatePixMessages } from "@/domain/factories/pix-message-factory";
import { IPixMessageRepository } from "@/domain/repositories/pix-message.repository.interface";
import { pixMessageNotifier } from "@/infra/events/new-pix-message.notifier";


export class CreatePixMessagesUseCase {
  constructor(private pixMessageRepository: IPixMessageRepository) { }

  async execute(ispb: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      throw new Error("Quantity should be a positive number.");
    }

    const pixMessages = generatePixMessages(ispb, quantity);

    await this.pixMessageRepository.createMany(pixMessages);

    pixMessageNotifier.emit(`newPixMessageTo${ispb}`);
  }
}