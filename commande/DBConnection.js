const mariadb = require('mariadb');
const pool = mariadb.createPool({
     host: process.env.MYSQL_HOST, 
     user:"root", 
     password: 'comroot123',
     connectionLimit: 5 ,
     database: process.env.MYSQL_DATABASE
});

module.exports=pool;