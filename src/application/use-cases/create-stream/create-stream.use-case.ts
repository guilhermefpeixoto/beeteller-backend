import { TooManyStreamsError } from "@/application/errors/TooManyStreamsError";
import { generateStream } from "@/domain/factories/stream.factory";
import { IStreamRepository } from "@/domain/repositories/stream.repository.interface";

export class CreateStreamUseCase {
  constructor(private readonly streamRepository: IStreamRepository) { }

  async execute(ispb: string): Promise<string> {
    const activeStreams = await this.streamRepository.countByIspb(ispb);

    if (activeStreams >= 6) {
      throw new TooManyStreamsError('Active streams to a ispb cannot be greater than 6')
    }

    const newStream = generateStream(ispb);
    await this.streamRepository.createStream(newStream);
    
    return newStream.id;
  }
}