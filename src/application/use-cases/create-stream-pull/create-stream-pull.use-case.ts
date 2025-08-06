import { generateStreamPull } from "@/domain/factories/stream.factory";
import { IStreamRepository } from "@/domain/repositories/stream.repository.interface";

export class CreateStreamPullUseCase {
  constructor(private readonly streamRepository: IStreamRepository) { }

  async execute(streamId: string): Promise<string> {
    const newStreamPull = generateStreamPull(streamId);
    await this.streamRepository.createStreamPull(newStreamPull);
    
    return newStreamPull.iterationId;
  }
}