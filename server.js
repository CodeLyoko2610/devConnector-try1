const express = require('express');
const connectDB = require('./config/db');

//Initialize express
const app = express();
//Connect database
connectDB();

//Endpoints
app.get('/', (req, res) => {
    res.send(`API is running.`);
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}.`);
});