import { Router } from "express";
import { PixMessageController } from "../controllers/pix-message.controller";
import { PrismaPixMessageRepository } from "../../database/prisma/repositories/prisma-pix-message.repository";
import { CreatePixMessagesUseCase } from "../../../application/use-cases/create-pix-messages/create-pix-messages.use-case";

const pixMessageRoutes = Router();

const pixMessageRepository = new PrismaPixMessageRepository();

const createPixMessagesUseCase = new CreatePixMessagesUseCase(pixMessageRepository);

const pixMessageController = new PixMessageController(createPixMessagesUseCase);

pixMessageRoutes.post('/util/msgs/:ispb/:number', (req, res) => { pixMessageController.create(req, res) });

export { pixMessageRoutes };