function error_handler(err, req, res, next)
{
    if (res.headersSent)
    {
        return next(err);
    }
    return res.status(500).json({ message: err.message });
}

module.exports = error_handler;