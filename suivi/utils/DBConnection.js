const mysql = require('mysql');

const dbconnection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
});

dbconnection.connect((err) => {
    if (err)
        throw err;
    console.log(`Connected to DB '${process.env.MYSQL_DATABASE}'`);
});

module.exports = dbconnection;
