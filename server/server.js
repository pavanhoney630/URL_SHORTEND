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
app.use(cors());

app.get('/', (req,res)=>{
  res.json("api is working");
})
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes)
  // Start server
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));