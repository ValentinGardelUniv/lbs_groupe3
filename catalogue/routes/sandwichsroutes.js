const express = require('express');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        res.json([]);
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
});

module.exports = router;
