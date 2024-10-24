import express, { Application, Request, Response } from 'express';
import MainRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import cors from 'cors';

const app:Application = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/api',MainRouter);

// app.use((req: Request, res: Response) => {
//   res.status(404).json({ message: 'Route not found' });
// });
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });