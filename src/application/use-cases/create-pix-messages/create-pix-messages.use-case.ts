import { IPixMessageRepository } from "../../../domain/repositories/pix-message.repository.interface";
import { generatePixMessages } from "../../../shared/utils/pix-message-generator";

export class CreatePixMessagesUseCase {
  constructor(private pixMessageRepository: IPixMessageRepository) { }

  async execute(ispb: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      throw new Error("Quantity should be a positive number.");
    }

    const pixMessages = generatePixMessages(ispb, quantity);

    await this.pixMessageRepository.createMany(pixMessages);
  }
}