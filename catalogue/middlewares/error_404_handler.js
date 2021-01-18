function error_404_handler(req, res, next)
{
    return res.status(404).json({ message: 'My Not Found' });
};

module.exports = error_404_handler;