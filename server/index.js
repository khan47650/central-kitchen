const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); // ✅ MongoDB connection
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const slotRoutes = require('./routes/slotRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dashboardRoutes=require('./routes/dashboardRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // ✅ Allow frontend origin
  credentials: true,               // ✅ Allow cookies/session
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats',dashboardRoutes);

// Health check route (optional)
app.get('/', (req, res) => {
  res.send('🚀 Central Kitchen API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});