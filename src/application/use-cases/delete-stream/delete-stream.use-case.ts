import { IStreamRepository } from "@/domain/repositories/stream.repository.interface";

export class DeleteStreamUseCase {
  constructor(private streamRepository: IStreamRepository) { }

  async execute(ispb: string, iterationId: string): Promise<void> {
    const streamPull = await this.streamRepository.findByIterationId(iterationId);

    if (!streamPull || streamPull.status == 'CLOSED') {
      throw Error('Cannot iteract with stream with this iteration id');
    }

    if (streamPull.stream.ispb != ispb) {
      throw Error('This stream does not have this ispb')
    }

    await this.streamRepository.deleteByIterationId(iterationId);
  }
}