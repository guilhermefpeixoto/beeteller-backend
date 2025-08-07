import z from "zod";
import { Request, Response } from "express";
import { PixMessageMapper } from "../mappers/pix-message.mapper";
import { DeleteStreamUseCase } from "@/application/use-cases/delete-stream/delete-stream.use-case";
import { InvalidInputError } from "@/shared/errors/InvalidInputError";
import { NotAcceptableHeaderError } from "@/infra/errors/NotAcceptableHeaderError";
import { FindNextPixMessagesUseCase } from "@/application/use-cases/find-next-pix-messages/find-next-pix-messages.use-case";

const findPixMessageByIspbStreamParamsSchema = z.object({
  ispb: z.string().length(8),
  iterationId: z.string().length(12),
})

const getMessageParams = z.object({
  ispb: z.string().length(8),
  iterationId: z.string().length(12).optional(),
});

export class PixMessageController {
  constructor(
    private readonly findNextPixMessagesUseCase: FindNextPixMessagesUseCase,
    private readonly deleteStreamUseCase: DeleteStreamUseCase,) { }

  async get(req: Request, res: Response): Promise<Response> {
    const validationResult = getMessageParams.safeParse(req.params);

    if (!validationResult.success) {
      throw new InvalidInputError('Invalid params input');
    }

    const { ispb, iterationId } = validationResult.data;
    const acceptHeader = req.get('Accept');
    let acceptHeaderType;

    if (!acceptHeader || acceptHeader.trim().includes('application/json')) {
      acceptHeaderType = 'application/json';
    }
    else if (acceptHeader.trim().includes('multipart/json')) {
      acceptHeaderType = 'multipart/json';
    }
    else {
      throw new NotAcceptableHeaderError("Value of 'Accept' header invalid");
    }

    const data = await this.findNextPixMessagesUseCase.execute({ ispb, iterationId, acceptHeaderType });

    if (data.status == 204) {
      return res.status(204).set('Pull-Next', data.nextURI).send();
    }

    let pixMessages;

    if (data.body && acceptHeaderType == 'application/json') {
      pixMessages = PixMessageMapper.toView(data.body[0]!)
    }

    pixMessages = data.body!.map(PixMessageMapper.toView);


    return res.status(200).set('Pull-Next', data.nextURI).json(pixMessages);
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
}