const express = require('express');
const bodyparser = require("body-parser");
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const moment = require('moment');

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
        if (req.body.nom_client && validator.isAscii(req.body.nom_client) && req.body.mail_client && validator.isEmail(req.body.mail_client) && req.body.date_livraison && moment(req.body.date_livraison, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
            let nouveauid = uuidv4();
            await dbclient.query("INSERT INTO commande (id, created_at, livraison, nom, mail) VALUES ('"+nouveauid+"', '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', '"+req.body.date_livraison+"', '"+validator.escape(req.body.nom_client)+"', '"+req.body.mail_client+"')");
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
        } else if (req.body.nom && validator.isAscii(req.body.nom) && req.body.mail && validator.isEmail(req.body.mail) && req.body.livraison.date && req.body.livraison.heure && moment(req.body.livraison.date+' '+req.body.livraison.heure, 'D-MM-YYYY HH:mm', true).isValid()) {
            let nouveauid = uuidv4();
            await dbclient.query("INSERT INTO commande (id, created_at, livraison, nom, mail, montant) VALUES ('"+nouveauid+"', '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', '"+moment(req.body.livraison.date+' '+req.body.livraison.heure, 'D-MM-YYYY HH:mm', true).format('YYYY-MM-DD HH:mm:ss')+"', '"+validator.escape(req.body.nom)+"', '"+req.body.mail+"', 0)");
            const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant FROM commande WHERE id = '"+nouveauid+"'");
            if (commande) {
                res.set('Location', '/commandes/'+nouveauid);
                return res.status(201).json({
                    commande: {
                        nom: commande.nom,
                        mail: commande.mail,
                        livraison: {
                            date: moment(commande.livraison, 'YYYY-MM-DD HH:mm:ss', true).format('D-MM-YYYY'),
                            heure: moment(commande.livraison, 'YYYY-MM-DD HH:mm:ss', true).format('HH:mm')
                        },
                        id: commande.id,
                        token: commande.token,
                        montant: commande.montant
                    }
                });
            }
            return handler404(res);
        } else
            next(500);
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
