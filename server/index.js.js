require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors')
const authRoutes = require('./routes/AuthRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
const corsOptions = {
  origin: "https://url-shortend-client.vercel.app", // URL of your React frontend
  methods: ["GET", "POST"], // HTTP methods allowed
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/', (req,res)=>{
  res.send("api is working fine");
})
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes)
  // Start server
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));