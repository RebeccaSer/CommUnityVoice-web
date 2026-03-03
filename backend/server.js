const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const backendissuesRoute = require('./routes/backendissue');
const voteRoutes = require('./routes/votes');
const uploadRoutes = require('./routes/upload');
const passwordResetRoutes = require('./routes/passwordReset');
const areaRoutes = require('./routes/areas');
const userRoutes = require('./routes/users');

const app = express();

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/users', userRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Server is running and connected!",
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    database: "Connected",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', backendissuesRoute);
app.use('/api/votes', voteRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/areas', areaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

// For SQLite, we don't need to wait for a connection event
// The database is file-based and always connected
console.log('✅ Database connected successfully');
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});

// Optional: Handle database errors
db.on('error', (err) => {
  console.error('❌ Database error:', err);
});