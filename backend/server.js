const dns = require('dns');
dns.setServers(['8.8.8.8']);

// --- Global error handlers (must be registered before anything else) ---

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException] Unhandled exception — shutting down:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandledRejection] Unhandled promise rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('[mongoose.connect] Connection error:', err));
const itemRoutes = require('./routes/items');
app.use('/api/items', itemRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// --- 404 handler (catches requests that matched no route) ---
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Express error middleware (catches errors passed via next(err)) ---
app.use((err, req, res, next) => {
  console.error('[Express error middleware]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error('[server.listen] Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
