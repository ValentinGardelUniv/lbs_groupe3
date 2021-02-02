const express = require('express');

const router = express.Router();

const handler404 = require("../utils/handler404");
const handler405 = require("../utils/handler405");
const Categorie = require("../models/Categorie");

router.get('/', async (req, res, next) => {
    let categories = [];
    try {
        categories = await Categorie.find({});
        if (categories)
            res.json(categories);
        return handler404(res);
    } catch (err) {
        next(500);
    }
}).all(handler405);

module.exports = router;
