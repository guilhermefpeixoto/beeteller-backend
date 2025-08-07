import express from 'express';
import { routes } from './routes/routes';
import { errorHandler } from './middlewares/error-handler';


const app = express();
app.use(express.json())

app.use('/api', routes);
app.use(errorHandler);

export { app }