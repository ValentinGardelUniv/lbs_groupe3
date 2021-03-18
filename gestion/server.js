const express = require('express');

const app = express();

const localport = process.env.LOCAL_PORT;
const distport = process.env.DIST_PORT;

const logger = require('./middlewares/logger');
const indexroutes = require('./routes/indexroutes');
const sandwichsroutes = require('./routes/sandwichsroutes');
const categoriesroutes = require('./routes/categoriesroutes');
const error400 = require('./middlewares/error400');
const error500 = require('./middlewares/error500');
const dbconnection = require('./utils/DBConnection');

// Logger
app.use(logger);

// Routes
app.use('/', indexroutes);
app.use('/sandwichs', sandwichsroutes);
app.use('/categories', categoriesroutes);

// Quand la route n'est pas connue
app.use(error400);

// Quand une erreur interne survient
app.use(error500);

app.listen(localport, () => {
    console.log(`API gestion up and running at localhost:${localport} (distant port : ${distport})`);
});
