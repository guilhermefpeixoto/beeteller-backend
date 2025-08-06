import express from 'express';
import { pixMessageRoutes } from './routes/pix-message.routes';
import { errorHandler } from './middlewares/error-handler';


const app = express();
app.use(express.json())

app.use('/api', pixMessageRoutes);
app.use(errorHandler);

export { app }