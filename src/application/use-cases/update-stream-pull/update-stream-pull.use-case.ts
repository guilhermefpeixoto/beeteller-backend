import { IStreamRepository } from "@/domain/repositories/stream.repository.interface";

export class UpdateStreamPullUseCase {
  constructor(private readonly streamRepository: IStreamRepository) { }

  async execute(iterationId: string): Promise<string> {
    const streamPull = await this.streamRepository.findByIterationId(iterationId);

    if (!streamPull || streamPull.status == 'CLOSED') {
      throw Error('Cannot get pix messages of this iteration id');
    }

    const streamId = await this.streamRepository.updateStreamPullStatusById(streamPull.id);

    return streamId;
  }
}