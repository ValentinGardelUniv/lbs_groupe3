const express = require('express');
const bodyparser = require("body-parser");

const router = express.Router();
const jsonparser = bodyparser.json();

const handler404 = require("../utils/handler404");
const handler405 = require("../utils/handler405");
const dbclient = require("../utils/DBClient");

router.get("/", async (req, res, next) => {
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
}).post("/", jsonparser, async (req, res, next) => {
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

router.get("/:id", async (req, res, next) => {
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

module.exports = router;
