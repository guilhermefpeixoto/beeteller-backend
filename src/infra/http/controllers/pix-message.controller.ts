import z from "zod";
import { Request, Response } from "express";
import { FindPixMessageByIspbUseCase } from "@/application/use-cases/find-pix-message/find-pix-message.use-case";
import { pixMessageNotifier } from "@/infra/events/new-pix-message.notifier";
import { PixMessageMapper } from "../mappers/pix-message.mapper";
import { FindPixMessagesByIspbUseCase } from "@/application/use-cases/find-pix-messages/find-pix-messages.use-case";
import { IPixMessageWithParticipants } from "@/domain/repositories/pix-message.repository.interface";
import { DeleteStreamUseCase } from "@/application/use-cases/delete-stream/delete-stream.use-case";
import { CreateStreamUseCase } from "@/application/use-cases/create-stream/create-stream.use-case";
import { CreateStreamPullUseCase } from "@/application/use-cases/create-stream-pull/create-stream-pull.use-case";
import { UpdateStreamPullUseCase } from "@/application/use-cases/update-stream-pull/update-stream-pull.use-case";
import { InvalidInputError } from "@/shared/errors/InvalidInputError";
import { NotAcceptableHeaderError } from "@/infra/errors/NotAcceptableHeaderError";

const findPixMessageByIspbParamSchema = z.object({
  ispb: z.string().length(8),
})

const findPixMessageByIspbStreamParamsSchema = z.object({
  ispb: z.string().length(8),
  iterationId: z.string().length(12),
})

type LongPollingConfig = {
  useCase: { execute: (ispb: string) => Promise<any> };
  condition: (data: any) => boolean;
  mapper: (data: any) => any;
  iterationId?: string;
  time: 8000;
}

export class PixMessageController {
  constructor(
    private readonly findPixMessageByIspbUseCase: FindPixMessageByIspbUseCase,
    private readonly findPixMessagesByIspbUseCase: FindPixMessagesByIspbUseCase,
    private readonly deleteStreamUseCase: DeleteStreamUseCase,
    private readonly createStreamUseCase: CreateStreamUseCase,
    private readonly createStreamPullUseCase: CreateStreamPullUseCase,
    private readonly updateStreamPullUseCase: UpdateStreamPullUseCase) { }


  async findByIspb(req: Request, res: Response): Promise<Response | void> {
    const validationResult = findPixMessageByIspbParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      throw new InvalidInputError('Invalid params input');
    }

    const ispb = validationResult.data.ispb;
    const acceptHeader = req.get('Accept');

    if (!acceptHeader || acceptHeader.trim().includes('application/json')) {
      const config: LongPollingConfig = {
        useCase: this.findPixMessageByIspbUseCase,
        condition: (data: IPixMessageWithParticipants | null) => data != null,
        mapper: (data: IPixMessageWithParticipants) => PixMessageMapper.toView(data),
        time: 8000,
      };

      return this.longPolling(res, ispb, config);
    }
    else if (acceptHeader.trim().includes('multipart/json')) {
      const config: LongPollingConfig = {
        useCase: this.findPixMessagesByIspbUseCase,
        condition: (data: IPixMessageWithParticipants[]) => data && data.length > 0,
        mapper: (data: IPixMessageWithParticipants[]) => data.map(PixMessageMapper.toView),
        time: 8000,
      };

      return this.longPolling(res, ispb, config);
    }
    else {
      throw new NotAcceptableHeaderError("Value of 'Accept' header invalid");
    }
  }

  async findByIspbStream(req: Request, res: Response): Promise<Response | void> {
    const validationResult = findPixMessageByIspbStreamParamsSchema.safeParse(req.params);

    if (!validationResult.success) {
      throw new InvalidInputError('Invalid params input');
    }

    const { ispb, iterationId } = validationResult.data;
    const acceptHeader = req.get('Accept');

    if (!acceptHeader || acceptHeader.trim().includes('application/json')) {
      const config: LongPollingConfig = {
        useCase: this.findPixMessageByIspbUseCase,
        condition: (data: IPixMessageWithParticipants | null) => data != null,
        mapper: (data: IPixMessageWithParticipants) => PixMessageMapper.toView(data),
        iterationId: iterationId,
        time: 8000,
      };

      return this.longPolling(res, ispb, config);
    }
    else if (acceptHeader.trim().includes('multipart/json')) {
      const config: LongPollingConfig = {
        useCase: this.findPixMessagesByIspbUseCase,
        condition: (data: IPixMessageWithParticipants[]) => data && data.length > 0,
        mapper: (data: IPixMessageWithParticipants[]) => data.map(PixMessageMapper.toView),
        iterationId: iterationId,
        time: 8000,
      };

      return this.longPolling(res, ispb, config);
    }
    else {
      throw new NotAcceptableHeaderError("Value of 'Accept' header invalid");
    }
  }

  async delete(req: Request, res: Response): Promise<Response | void> {
    const validationResult = findPixMessageByIspbStreamParamsSchema.safeParse(req.params);

    if (!validationResult.success) {
      throw new InvalidInputError('Invalid params input');
    }

    const { ispb, iterationId } = validationResult.data;

    await this.deleteStreamUseCase.execute(ispb, iterationId);

    return res.status(200).json();
  }

  private async longPolling(res: Response, ispb: string, config: LongPollingConfig): Promise<void> {
    let nextIterationId;
    if (!config.iterationId) {
      const newStreamId = await this.createStreamUseCase.execute(ispb);
      nextIterationId = await this.createStreamPullUseCase.execute(newStreamId);
    }

    if (config.iterationId) {
      const streamId = await this.updateStreamPullUseCase.execute(ispb, config.iterationId);
      nextIterationId = await this.createStreamPullUseCase.execute(streamId)
    }

    const pixMessages = await config.useCase.execute(ispb);
    const nextURI = `http://localhost:8000/api/pix/${ispb}/stream/${nextIterationId}`;

    if (config.condition(pixMessages)) {
      res.status(200).set('Pull-Next', nextURI).json(config.mapper(pixMessages));
      return;
    }

    const event = `newPixMessageTo${ispb}`;
    const onEvent = async () => {
      clearTimeout(timeoutId);

      const pixMessages = await config.useCase.execute(ispb);

      if (config.condition(pixMessages)) {
        res.status(200).set('Pull-Next', nextURI).json(config.mapper(pixMessages));
      } else {
        res.status(204).set('Pull-Next', nextURI).send();
      }
    };

    const timeoutId = setTimeout(() => {
      pixMessageNotifier.removeListener(event, onEvent);
      res.status(204).set('Pull-Next', nextURI).send();
    }, config.time);

    pixMessageNotifier.once(event, onEvent);

    res.on('close', () => {
      clearTimeout(timeoutId);
      pixMessageNotifier.removeListener(event, onEvent);
    });
  }
}