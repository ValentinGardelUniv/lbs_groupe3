const dbconnection = require('./DBConnection');

class DBClient {
    static async all(query) {
        return new Promise((resolve, reject) => {
            dbconnection.query(query, (err, result, next)=> {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    static async one(query) {
        return new Promise((resolve, reject) => {
            dbconnection.query(query, (err, result, next)=> {
                if (err)
                    reject(err);
                resolve(result[0]);
            });
        });
    }
    static async query(query) {
        return new Promise((resolve, reject) => {
            dbconnection.query(query, (err, result, next)=> {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}

module.exports = DBClient;
