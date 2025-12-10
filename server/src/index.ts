import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import { setupSwagger } from './config/swagger';
import configurePassport from './config/passport';

// Route Imports
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import challengeRoutes from './routes/challenge.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();
connectDB(); // Connect to MongoDB
configurePassport(); // For Oauth login for Google

const app: Express = express();
app.set('trust proxy', 1);  // Necessary for my Oauth

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://neurogrid-client.onrender.com'
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;  // Local will be 5001

const allowedOrigins = [
  'http://localhost:5173', // Local frontend
  'https://neurogrid-client.onrender.com'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming Origin:", origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error("CORS Error: Origin not allowed:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

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

export const activeSessions = new Map();

// Socket Configuration
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User identifies themselves
  socket.on('identify', (userData) => {
    // Save user info
    socket.data.user = userData;
    // Emit that the user is online
    io.to('admin-room').emit('user_online', userData);
  });

  // User starts/updates a game
  socket.on('game_update', (gameData) => {
    // Broadcast user's data to admin room
    // Need to attach user data so admin knows who it is
    if (socket.data.user) {
        io.to('admin-room').emit('live_session_update', {
            user: socket.data.user,
            game: gameData
        });
        activeSessions.set(socket.data.user._id, { user: socket.data.user, game: gameData });
    }
  });

  // Admin joins the monitoring room
  socket.on('admin_join', () => {
    socket.join('admin-room');
    // Send current active sessions immediately
    socket.emit('init_active_sessions', Array.from(activeSessions.values()));
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket.data.user) {
        activeSessions.delete(socket.data.user._id);
        io.to('admin-room').emit('user_offline', socket.data.user._id);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server (HTTP + Socket) is running on port ${PORT}`);
});