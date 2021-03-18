const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to the LBS Suivi API')
});

module.exports = router;
