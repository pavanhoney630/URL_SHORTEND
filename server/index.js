require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const authRoutes = require('./routes/AuthRoutes');
const app = express();


// Middleware
app.use(express.json());
const corsOptions = {
  origin: ["https://url-shortend-client.vercel.app","http://localhost:3000"], // URL of your React frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // HTTP methods allowed
  allowedHeaders: ['Content-Type', 'Authorization'],
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
  const PORT = process.env.PORT || 5000;
  app.listen(PORT , () => console.log(`Server running on port ${PORT}`));