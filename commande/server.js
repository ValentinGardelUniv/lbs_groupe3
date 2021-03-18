const express = require('express');
const cors = require('cors');

const app = express();

const localport = process.env.LOCAL_PORT;
const distport = process.env.DIST_PORT;

const logger = require('./middlewares/logger');
const indexroutes = require('./routes/indexroutes');
const commandesroutes = require('./routes/commandesroutes');
const error400 = require('./middlewares/error400');
const error500 = require('./middlewares/error500');

// CORS - allow access from everywhere
app.use(cors());

// Vérifie la présence du header Origin dans les requêtes
app.use(function(req, res, next) {
    console.log(req.header('Origin'));
    next();
});

// Logger
app.use(logger);

// Routes
app.use('/', indexroutes);
app.use('/commandes', commandesroutes);

// Quand la route n'est pas connue
app.use(error400);

// Quand une erreur interne survient
app.use(error500);

app.listen(localport, function() {
    console.log(`API commande up and running at localhost:${localport} (distant port : ${distport})`);
});
