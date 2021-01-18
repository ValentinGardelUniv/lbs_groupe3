const mongoose = require("mongoose");

mongoose.connect("mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + "@" + process.env.MONGO_HOST + ":27017/" + process.env.MONGO_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`Connection to DB ${process.env.MONGO_DATABASE}...`);
});

module.exports = mongoose;
