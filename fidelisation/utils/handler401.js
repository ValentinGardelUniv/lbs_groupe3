// Quand la ressource n'existe pas
const handler401 = function(res) {
    res.status(401).json({
        type: "error",
        error: 401,
        message: "no authorization header present"
    });
}

module.exports = handler401;
