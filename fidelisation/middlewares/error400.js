const error400 = function(req, res) {
    res.status(400).json({
        type: 'error',
        error: 400,
        message: 'Bad Request'
    });
};

module.exports = error400;
