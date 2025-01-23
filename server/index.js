const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./routes/AuthRoutes');


require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.get('/ping', (req, res) => {
    res.send('PONG');
});

const corsOptions = {
  origin: "https://url-shortend-client.vercel.app", // URL of your React frontend
  methods: ["GET", "POST"], // HTTP methods allowed
};

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/auth', AuthRouter);

const mongo_url = process.env.MONGO_URI;

   mongoose.connect(mongo_url)
    .then(() => {
        console.log('MongoDB Connected...');
    }).catch((err) => {
        console.log('MongoDB Connection Error: ', err);
    })

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})