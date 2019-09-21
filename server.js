const express = require('express');
const app = express();

const connection = require('./config/db');
connection();

app.use(express.json({ extended: false }));

app.use('/api/user', require('./route/api/user'));
app.use('/api/auth', require('./route/api/auth'));
app.use('/api/profile', require('./route/api/profile'));
app.use('/api/post', require('./route/api/post'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
