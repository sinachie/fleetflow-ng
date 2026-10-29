require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter); // Apply to all API routes
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(express.json());

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

// Socket.IO — real-time driver↔office comms
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('chat:message', (payload) => {
    // Broadcast to everyone in room (simple; swap for per-company rooms)
    io.emit('chat:message', payload);
  });

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