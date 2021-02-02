const logger = function (req, res, next) {
    let datetime = new Date();
    let datetimeprepare = datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + datetime.getDate() + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
    console.log(`[${datetimeprepare}] ${req.method}:${req.url} ${res.statusCode}`);
    next();
};

module.exports = logger;
