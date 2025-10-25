import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import { setupSwagger } from './config/swagger';

dotenv.config();

connectDB(); // Connect to MongoDB

const app: Express = express();
const PORT = process.env.PORT || 5001;  // Local will be 5001

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger
setupSwagger(app);

// TEST ROUTE
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the NeuroGrid API!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});