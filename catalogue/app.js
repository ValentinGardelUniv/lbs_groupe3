const express = require('express');
const app = express();

const port=process.env.LOCAL_PORT || 3000

//const commandsRouter = require('./routes/commandsRoute.js');

const error_handler=require('./middlewares/error_handler.js');
const error_404_handler=require('./middlewares/error_404_handler.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use('/commandes', commandsRouter);

app.use(error_404_handler);

app.use(error_handler);

app.listen(port);