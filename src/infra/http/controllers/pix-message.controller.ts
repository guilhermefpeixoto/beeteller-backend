import z from "zod";
import { Request, Response } from "express";
import { CreatePixMessagesUseCase } from "@/application/use-cases/create-pix-messages/create-pix-messages.use-case";


const createPixMessageParamsSchema = z.object({
  ispb: z.string().length(8),
  number: z.coerce.number().positive(),
});

export class PixMessageController {
  constructor(private readonly createPixMessagesUseCase: CreatePixMessagesUseCase) { }

  async create(req: Request, res: Response): Promise<Response> {
    const validationResult = createPixMessageParamsSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).send();
    }

    const data = validationResult.data;

    await this.createPixMessagesUseCase.execute(data.ispb, data.number);

    return res.status(201).send();
  }
}