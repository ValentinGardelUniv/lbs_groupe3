/*const mysql = require('mysql');

const HOST=process.env.MYSQL_HOST;
const USER="root";//process.env.MYSQL_USER;
const PW="comroot123";//process.env.MYSQL_PASSWORD;

var con = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PW
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

module.exports=con;*/

const mariadb = require('mariadb');
const pool = mariadb.createPool({
     host: process.env.MYSQL_HOST, 
     user:"root", 
     password: 'comroot123',
     connectionLimit: 5 ,
     database: process.env.MYSQL_DATABASE
});
/*
pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT 1 as val")
        .then((rows) => {
          console.log(rows); //[ {val: 1}, meta: ... ]
          //Table must have been created before 
          // " CREATE TABLE myTable (id int, val varchar(255)) "
          return conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
        })
        .then((res) => {
          console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
        })
        .catch(err => {
          //handle error
          console.log(err); 
          conn.end();
        })
        
    }).catch(err => {
      //not connected
    });
*/
module.exports=pool;