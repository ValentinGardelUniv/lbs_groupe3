const express = require('express');

const app = express();

const localport = process.env.LOCAL_PORT;
const distport = process.env.DIST_PORT;

const dbconnection = require("./utils/DBConnection");
const indexroutes = require("./routes/indexroutes");
const sandwichsroutes = require("./routes/sandwichsroutes");
const categoriesroutes = require("./routes/categoriesroutes");

// Logger middleware
app.use(function (req, res, next) {
    let datetime = new Date();
    let datetimeprepare = datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + datetime.getDate() + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
    console.log(`[${datetimeprepare}] ${req.method}:${req.url} ${res.statusCode}`);
    next();
});

app.use("/", indexroutes);
app.use("/sandwichs", sandwichsroutes);
app.use("/categories", categoriesroutes);

app.listen(localport, () => {
    console.log(`API catalogue up and running at localhost:${localport} (distant port : ${distport})`);
});
