const error500 = function(err, req, res) {
    return res.status(500).json({
        type: 'error',
        error: 500,
        message: 'Internal Server Error'
    });
};

module.exports = error500;
