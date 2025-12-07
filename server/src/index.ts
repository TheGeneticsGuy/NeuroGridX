import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import connectDB from './config/db';
import { setupSwagger } from './config/swagger';
import configurePassport from './config/passport';
import authRoutes from './routes/auth.routes';

// Route Imports
import userRoutes from './routes/user.routes';
import challengeRoutes from './routes/challenge.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();
connectDB(); // Connect to MongoDB
configurePassport(); // For Oauth login for Google

const app: Express = express();
app.set('trust proxy', 1);  // Necessary for my Oauth

const allowedOrigins = [
  'http://localhost:5173', // Local frontend
  'https://neurogrid-client.onrender.com'
];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};
app.use(cors(options));

const PORT = process.env.PORT || 5001;  // Local will be 5001

// Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Swagger
setupSwagger(app);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Test route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the NeuroGrid API!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});