const express = require("express");
const bodyparser = require("body-parser");

const app = express();
const jsonparser = bodyparser.json();

const localport = process.env.LOCAL_PORT;
const distport = process.env.DIST_PORT;

const dbclient = require("./utils/DBClient");

// Logger middleware
app.use(function (req, res, next) {
    let datetime = new Date();
    let datetimeprepare = datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + datetime.getDate() + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
    console.log(`[${datetimeprepare}] ${req.method}:${req.url} ${res.statusCode}`);
    next();
});

// Quand la ressource n'existe pas
function handler404(res) {
    res.status(404).json({
        type: "error",
        error: 404,
        message: "Not Found"
    });
}

// Quand la méthode utilisée ne correspond pas
function handler405(req, res) {
    res.status(405).json({
        type: "error",
        error: 405,
        message: "Method Not Allowed"
    });
}

app.route("/commandes").get(async (req, res, next) => {
    try {
        const commandes = await dbclient.all("SELECT id, created_at, mail, montant FROM commande");
        if (commandes)
            return res.json({
                type: "collection",
                count: commandes.length,
                commandes: commandes.map((commande) => {
                    return {
                        id: commande.id,
                        mail_client: commande.mail,
                        date_commande: commande.created_at,
                        montant: commande.montant
                    }
                })
            });
    return handler404(res);
    } catch(err) {
        next(500);
    }
});

app.route("/commandes/:id").get(async (req, res, next) => {
    try {
        const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant FROM commande WHERE id = '"+req.params.id+"'");
        if (commande)
            return res.json({
                type: "resource",
                commande: {
                    id: commande.id,
                    mail_client: commande.mail,
                    nom_client: commande.nom,
                    date_commande: commande.created_at,
                    date_livraison: commande.livraison,
                    montant: commande.montant
                }
            });
        return handler404(res);
    } catch(err) {
        next(500);
    }
}).all(handler405);

app.route("/commandes").post(jsonparser, async (req, res, next) => {
    try {
        if (!(req.body.nom_client && req.body.mail_client && req.body.date_livraison))
            throw new Error();
        //const commande = await dbclient.one("SELECT id, created_at, mail, montant FROM commande WHERE id = '"+req.params.id+"'");
        return res.json("coucou");
        if (commande)
            return res.json({
                type: "resource",
                commande: commande
            });
        return handler404(res);
    } catch(err) {
        console.log("dsq");
        next(500);
    }
}).all(handler405);

// Quand la route n'est pas connue
app.use(function(req, res) {
    res.status(400).json({
        type: "error",
        error: 400,
        message: "Bad Request"
    });
});

// Quand une erreur interne survient
app.use(function(err, req, res) {
    console.log("fsf");
    return res.status(500).json({
        type: "error",
        error: 500,
        message: "Internal Server Error"
    });
});

app.listen(localport, function() {
    console.log(`API commande up and running at localhost:${localport} (distant port : ${distport})`);
});
