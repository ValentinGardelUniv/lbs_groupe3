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
            next(500);
        let dateaujourdhui = new Date();
        let journeeaujourdhui = dateaujourdhui.getDate();
        if (journeeaujourdhui < 10)
            journeeaujourdhui = "0" + journeeaujourdhui;
        let moisaujourdhui = dateaujourdhui.getMonth() + 1;
        if (moisaujourdhui < 10)
            moisaujourdhui = "0" + moisaujourdhui;
        let heureaujourdhui = dateaujourdhui.getHours();
        if (heureaujourdhui < 10)
            heureaujourdhui = "0" + heureaujourdhui;
        let minutesaujourdhui = dateaujourdhui.getMinutes();
        if (minutesaujourdhui < 10)
            minutesaujourdhui = "0" + minutesaujourdhui;
        let secondesaujourdhui = dateaujourdhui.getSeconds();
        if (secondesaujourdhui < 10)
            secondesaujourdhui = "0" + secondesaujourdhui;
        let nouveauid = "fzefz";
        let datetimecreation = dateaujourdhui.getFullYear() + "-" + moisaujourdhui + "-" + journeeaujourdhui + " " + heureaujourdhui + ":" + minutesaujourdhui + ":" + secondesaujourdhui;
        await dbclient.query("INSERT INTO commande (id, created_at, livraison, nom, mail) VALUES ('"+nouveauid+"', '"+datetimecreation+"', '"+req.body.date_livraison+"', '"+req.body.nom_client+"', '"+req.body.mail_client+"')");
        const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant FROM commande WHERE id = '"+nouveauid+"'");
        if (commande) {
            res.set('Location', '/commandes/'+nouveauid);
            return res.status(201).json({
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
        }
        return handler404(res);
    } catch(err) {
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
