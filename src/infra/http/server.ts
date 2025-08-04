import express from 'express';
import { pixMessageRoutes } from './routes/pix-message.routes';

const app = express();
app.use(express.json())

app.use('/api', pixMessageRoutes);

export { app }