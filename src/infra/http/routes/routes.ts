import { CreatePixMessagesUseCase } from "@/application/use-cases/create-pix-messages/create-pix-messages.use-case";
import { PrismaPixMessageRepository } from "@/infra/database/prisma/repositories/prisma-pix-message.repository";
import { Router } from "express";
import { PixMessageController } from "../controllers/pix-message.controller";
import { FindPixMessageByIspbUseCase } from "@/application/use-cases/find-pix-message/find-pix-message.use-case";
import { FindPixMessagesByIspbUseCase } from "@/application/use-cases/find-pix-messages/find-pix-messages.use-case";
import { PrismaStreamRepository } from "@/infra/database/prisma/repositories/prisma-stream-repository";
import { DeleteStreamUseCase } from "@/application/use-cases/delete-stream/delete-stream.use-case";
import { CreateStreamUseCase } from "@/application/use-cases/create-stream/create-stream.use-case";
import { CreateStreamPullUseCase } from "@/application/use-cases/create-stream-pull/create-stream-pull.use-case";
import { UpdateStreamPullUseCase } from "@/application/use-cases/update-stream-pull/update-stream-pull.use-case";
import { UtilController } from "../controllers/util-controller";


const routes = Router();
const pixMessageRepository = new PrismaPixMessageRepository();
const streamRepository = new PrismaStreamRepository();
const createPixMessagesUseCase = new CreatePixMessagesUseCase(pixMessageRepository);
const findPixMessageByIspbUseCase = new FindPixMessageByIspbUseCase(pixMessageRepository);
const findPixMessagesByIspbUseCase = new FindPixMessagesByIspbUseCase(pixMessageRepository);
const deleteStreamUseCase = new DeleteStreamUseCase(streamRepository);
const createStreamUseCase = new CreateStreamUseCase(streamRepository);
const createStreamPullUseCase = new CreateStreamPullUseCase(streamRepository);
const updateStreamPullUseCase = new UpdateStreamPullUseCase(streamRepository);
const utilController = new UtilController(createPixMessagesUseCase);
const pixMessageController = new PixMessageController(findPixMessageByIspbUseCase, findPixMessagesByIspbUseCase, deleteStreamUseCase, createStreamUseCase, createStreamPullUseCase, updateStreamPullUseCase);

routes.post('/util/msgs/:ispb/:number', async (req, res) => { await utilController.create(req, res) });
routes.get('/pix/:ispb/stream/start', async (req, res) => { await pixMessageController.findByIspb(req, res) });
routes.get('/pix/:ispb/stream/:iterationId', async (req, res) => { await pixMessageController.findByIspbStream(req, res) });
routes.delete('/pix/:ispb/stream/:iterationId', async (req, res) => { await pixMessageController.delete(req, res) });

export { routes };