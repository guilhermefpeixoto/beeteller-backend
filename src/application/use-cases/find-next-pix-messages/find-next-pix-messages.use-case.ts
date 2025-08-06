import { StreamNotFoundError } from "@/application/errors/StreamNotFoundError";
import { TooManyStreamsError } from "@/application/errors/TooManyStreamsError";
import { generateStream, generateStreamPull } from "@/domain/factories/stream.factory";
import { IPixMessageRepository, IPixMessageWithParticipants } from "@/domain/repositories/pix-message.repository.interface";
import { IStreamRepository } from "@/domain/repositories/stream.repository.interface";
import { pixMessageNotifier } from "@/infra/events/new-pix-message.notifier";
import { InvalidInputError } from "@/shared/errors/InvalidInputError";

interface IFindNextPixMessages {
  ispb: string;
  acceptHeaderType: string;
  iterationId?: string | undefined;
}

interface INextPixMessages {
  status: 200 | 204;
  body: IPixMessageWithParticipants[] | null;
  nextURI: string;
}

const LONG_POLLING_TIMEOUT = 8000;
const MAX_ACTIVE_STREAMS = 6

export class FindNextPixMessagesUseCase {
  constructor(
    private readonly pixMessageRepository: IPixMessageRepository,
    private readonly streamRepository: IStreamRepository) { }

  async execute(input: IFindNextPixMessages): Promise<INextPixMessages> {
    const { ispb, acceptHeaderType, iterationId } = input

    const streamId = await this.getStreamId(ispb, iterationId);

    const limit = acceptHeaderType == 'application/json' ? 1 : 10;

    let pixMessages = await this.pixMessageRepository.findPixMessagesByIspb(ispb, limit);

    if (pixMessages.length == 0) {
      pixMessages = await this.awaitNewPixMessages(ispb, limit);
    }

    const nextURI = await this.generateNextUri(ispb, streamId);

    if (pixMessages.length == 0) {
      return {
        status: 204,
        body: null,
        nextURI,
      };
    }

    return {
      status: 200,
      body: pixMessages,
      nextURI,
    };
  }

  private async getStreamId(ispb: string, iterationId?: string): Promise<string> {
    let streamId: string;

    if (!iterationId) {
      const activeStreams = await this.streamRepository.countByIspb(ispb);

      if (activeStreams >= MAX_ACTIVE_STREAMS) {
        throw new TooManyStreamsError('Active streams to a ispb cannot be greater than 6');
      }

      const stream = generateStream(ispb);
      streamId = stream.id;
      await this.streamRepository.createStream(stream);
    } else {
      const streamPull = await this.streamRepository.findByIterationId(iterationId);
      if (!streamPull || streamPull.status == 'CLOSED') {
        throw new StreamNotFoundError(`There is no active Stream Pull with iteration id ${iterationId}`);
      }
      if (streamPull.stream.ispb !== ispb) {
        throw new InvalidInputError(`The Stream Pull ${iterationId} does not belong to ispb ${ispb}`);
      }
      streamId = streamPull.streamId;
      await this.streamRepository.updateStreamPullStatusById(streamPull.id);
    }
    return streamId;
  }

  private async awaitNewPixMessages(ispb: string, limit: number): Promise<IPixMessageWithParticipants[]> {
    const eventName = `newPixMessageTo${ispb}`;
    const startTime = Date.now();
    let remainingWaitTime = LONG_POLLING_TIMEOUT;
    let pixMessages: IPixMessageWithParticipants[] = [];

    while (remainingWaitTime > 0) {
      let timeoutId: NodeJS.Timeout | null = null;
      let listenerCallback: (() => void) | undefined = undefined;

      try {
        const eventPromise = new Promise<boolean>((resolve) => {
          listenerCallback = () => resolve(true);
          pixMessageNotifier.once(eventName, listenerCallback);
        });

        const timeoutPromise = new Promise<boolean>((resolve) => {
          timeoutId = setTimeout(() => resolve(false), remainingWaitTime);
        });

        const eventArrived = await Promise.race([eventPromise, timeoutPromise]);

        if (eventArrived) {
          pixMessages = await this.pixMessageRepository.findPixMessagesByIspb(ispb, limit);
          if (pixMessages.length > 0) {
            break;
          }
        } else {
          break;
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (listenerCallback) {
          pixMessageNotifier.removeListener(eventName, listenerCallback);
        }
      }

      const elapsedTime = Date.now() - startTime;
      remainingWaitTime = LONG_POLLING_TIMEOUT - elapsedTime;
    }

    return pixMessages;
  }

  private async generateNextUri(ispb: string, streamId: string): Promise<string> {
    const newStreamPull = generateStreamPull(streamId);
    const nextIterationId = newStreamPull.iterationId;
    await this.streamRepository.createStreamPull(newStreamPull);

    return `http://localhost:8000/api/pix/${ispb}/stream/${nextIterationId}`;
  }
}