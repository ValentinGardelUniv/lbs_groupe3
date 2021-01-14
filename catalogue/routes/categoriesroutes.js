const express = require('express');

const router = express.Router();

const Categorie = require("../models/Categorie");

router.get('/', async (req, res, next) => {
    let categories = [];
    try {
        categories = await Categorie.find();
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
    res.json(categories);
});

module.exports = router;
