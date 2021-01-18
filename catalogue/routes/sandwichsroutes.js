const express = require('express');

const router = express.Router();

const Sandwich = require("../models/Sandwich");

router.get('/', async (req, res, next) => {
    let sandwichs = [];
    try {
        sandwichs = await Sandwich.find({});
        console.log(sandwichs);
        res.json(sandwichs);
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
});

module.exports = router;
