require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dns = require('dns'); // Added for Windows DNS fix

// Force public DNS to fix local connection issues
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const server = http.createServer(app);

// 1. Define allowed origins
const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://fleetflow.com.ng',
  'https://www.fleetflow.com.ng',
  'https://fleetflow-ng-frontend.vercel.app'
];

// 2. CORS MUST BE FIRST
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] 
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// 3. Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Allow controllers to access 'io'
app.set('io', io); 

// 4. NOW apply Helmet, JSON parsing, and Rate Limiting
app.use(helmet());

// Parse JSON for all routes EXCEPT the webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/subscriptions/webhook') {
    next(); 
  } else {
    express.json()(req, res, next);
  }
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Health check
app.get('/', (_req, res) =>
  res.json({
    name: 'FleetFlow NG API',
    developer: 'Ifesinachi John Nduka',
    copyright: '© 2026 All Rights Reserved',
    status: 'ok',
  })
);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/eld', require('./routes/eldRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));

// 5. Socket.IO Real-Time Logic (Cleaned up)
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // The broadcasting is now handled by the messageController
  socket.on('disconnect', () => console.log('❌ Disconnected:', socket.id));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 FleetFlow NG API running on port ${PORT}`);
    console.log('👨‍💻 Developer: Ifesinachi John Nduka');
    console.log('© 2026 All Rights Reserved');
  });
})();