import { CreatePixMessagesUseCase } from "@/application/use-cases/create-pix-messages/create-pix-messages.use-case";
import { PrismaPixMessageRepository } from "@/infra/database/prisma/repositories/prisma-pix-message.repository";
import { Router } from "express";
import { PixMessageController } from "../controllers/pix-message.controller";
import { PrismaStreamRepository } from "@/infra/database/prisma/repositories/prisma-stream-repository";
import { DeleteStreamUseCase } from "@/application/use-cases/delete-stream/delete-stream.use-case";
import { UtilController } from "../controllers/util-controller";
import { FindNextPixMessagesUseCase } from "@/application/use-cases/find-next-pix-messages/find-next-pix-messages.use-case";


const routes = Router();
const pixMessageRepository = new PrismaPixMessageRepository();
const streamRepository = new PrismaStreamRepository();
const createPixMessagesUseCase = new CreatePixMessagesUseCase(pixMessageRepository);
const deleteStreamUseCase = new DeleteStreamUseCase(streamRepository);
const findNextPixMessagesUseCase = new FindNextPixMessagesUseCase(pixMessageRepository, streamRepository);
const utilController = new UtilController(createPixMessagesUseCase);
const pixMessageController = new PixMessageController(findNextPixMessagesUseCase, deleteStreamUseCase);

routes.post('/util/msgs/:ispb/:number', async (req, res) => { await utilController.create(req, res) });
routes.get('/pix/:ispb/stream/start', async (req, res) => { await pixMessageController.get(req, res) });
routes.get('/pix/:ispb/stream/:iterationId', async (req, res) => { await pixMessageController.get(req, res) });
routes.delete('/pix/:ispb/stream/:iterationId', async (req, res) => { await pixMessageController.delete(req, res) });

export { routes };