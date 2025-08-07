import { StreamNotFoundError } from "@/application/errors/StreamNotFoundError";
import { IStreamRepository } from "@/domain/repositories/stream.repository.interface";
import { InvalidInputError } from "@/shared/errors/InvalidInputError";

export class DeleteStreamUseCase {
  constructor(private streamRepository: IStreamRepository) { }

  async execute(ispb: string, iterationId: string): Promise<void> {
    const streamPull = await this.streamRepository.findByIterationId(iterationId);

    if (!streamPull || streamPull.status == 'CLOSED') {
      throw new StreamNotFoundError(`There is no active Stream Pull with iteration id ${iterationId}`);
    }

    if (streamPull.stream.ispb != ispb) {
      throw new InvalidInputError(`The Stream Pull ${iterationId} does not belong to ispb ${ispb}`);
    }

    await this.streamRepository.deleteByIterationId(iterationId);
  }
}