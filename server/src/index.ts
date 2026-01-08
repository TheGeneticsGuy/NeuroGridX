import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
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

app.use(cors({
  origin: true, // Allow requests
  credentials: true
}));

const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:5173',                // Local Development
  'https://www.neurogrid-x.com',          // Production (Primary)
  'https://neurogrid-x.com'               // Production (Non-WWW fallback)
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5001;  // Local will be 5001

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

// Applying CORS
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(passport.initialize());

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

const activeSessions = new Map<string, any>();

// Socket Configuration
io.on('connection', (socket) => {
  // 1. Identify
  socket.on('identify', (userData) => {
    socket.data.user = userData;
    // We don't add to map yet, wait for game start
  });

  // 2. Game Update
  socket.on('game_update', (gameData) => {
    if (!socket.data.user) return;

    const userId = socket.data.user._id || socket.data.user.id;

    const sessionData = {
        socketId: socket.id,
        user: socket.data.user,
        game: gameData,
        lastUpdate: Date.now()
    };

    activeSessions.set(userId, sessionData); // session will track the user ID

    // Broadcast the full list is overkill, I am gonna just broadcast an update
    io.to('admin-room').emit('live_session_update', sessionData);
  });

  socket.on('game_end', () => {
      if (socket.data.user) {
          const userId = socket.data.user._id || socket.data.user.id;
          // Note - immediately marking as ended, but on frontend I will persist for at least 10 seconds
          // so admin can quickly see score.
          // Maybe I should add a refresh button...

          const session = activeSessions.get(userId);
          if (session) {
              session.game.status = 'Finished';
              io.to('admin-room').emit('live_session_update', session);

              // Remove from server memory after 10s to clean up
              setTimeout(() => {
                  if (activeSessions.has(userId) && activeSessions.get(userId).game.status === 'Finished') {
                      activeSessions.delete(userId);
                      io.to('admin-room').emit('session_ended', userId);
                  }
              }, 10000);
          }
      }
  });

  socket.on('admin_join', () => {
    socket.join('admin-room');
    socket.emit('init_active_sessions', Array.from(activeSessions.values()));
  });

  // Disconnect (Tab Close / Navigate Away)
  socket.on('disconnect', () => {
    if (socket.data.user) {
        const userId = socket.data.user._id || socket.data.user.id;
        if (activeSessions.has(userId)) {
            activeSessions.delete(userId);
            io.to('admin-room').emit('session_ended', userId);
        }
    }
  });

  setInterval(() => {
    const now = Date.now();
    activeSessions.forEach((session, userId) => {
        // If status is 'InProgress' (or undefined) and no update for 5 seconds...
        // This is just a live feed update in case a user tabs away.
        if (session.game.status !== 'Finished' && (now - session.lastUpdate > 5000)) {
            activeSessions.delete(userId);
            io.to('admin-room').emit('session_ended', userId);
        }
    });
  }, 2000);

});

httpServer.listen(PORT, () => {
  console.log(`Server (HTTP + Socket) is running on port ${PORT}`);
});