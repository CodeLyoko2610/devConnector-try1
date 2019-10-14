const express = require('express');

//Initialize express
const app = express();


//Endpoints
app.get('/', (req, res) => {
    res.send(`API is running.`);
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}.`);
});