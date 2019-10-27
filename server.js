const express = require('express');
const connectDB = require('./config/db');

//Initialize (Init) express
const app = express();

//Init middlewares
app.use(express.json({ extended: false }));

//Connect database
connectDB();
//Connect app
app.get('/', (req, res) => {
    res.send(`API is running.`);
});

//Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profiles', require('./routes/api/profiles'));


const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}.`);
});