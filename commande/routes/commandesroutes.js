const express = require('express');
const bodyparser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const moment = require('moment');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();
const jsonparser = bodyparser.json();

const handler404 = require('../utils/handler404');
const handler405 = require('../utils/handler405');
const dbclient = require('../utils/DBClient');

router.get('/', async (req, res, next) => {
    try {
        let token = '';
        if (req.query.token)
            token = req.query.token;
        else if (req.header('X-lbs-token'))
            token = req.header('X-lbs-token');
        const commandes = await dbclient.all("SELECT id, created_at, mail, montant FROM commande WHERE token = '"+token+"'");
        if (commandes)
            return res.json({
                type: 'collection',
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
}).post('/', jsonparser, async (req, res, next) => {
    try {
        // Création simpliste (cf TD3)
        if (req.body.nom_client && validator.isAscii(req.body.nom_client) && req.body.mail_client && validator.isEmail(req.body.mail_client) && req.body.date_livraison && moment(req.body.date_livraison, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
            let nouveauid = uuidv4();
            await dbclient.query("INSERT INTO commande (id, created_at, livraison, nom, mail) VALUES ('"+nouveauid+"', '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', '"+req.body.date_livraison+"', '"+validator.escape(req.body.nom_client)+"', '"+req.body.mail_client+"')");
            const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant FROM commande WHERE id = '"+nouveauid+"'");
            if (commande) {
                res.set('Location', '/commandes/'+nouveauid);
                return res.status(201).json({
                    type: 'resource',
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
        // Méthode de création finale (TD6)
        } else if (req.body.nom && validator.isAscii(req.body.nom) && req.body.mail && validator.isEmail(req.body.mail) && req.body.livraison.date && req.body.livraison.heure && moment(req.body.livraison.date+' '+req.body.livraison.heure, 'D-MM-YYYY HH:mm', true).isValid() && req.body.items) {
            let nouveauid = uuidv4();
            let token = crypto.randomBytes(32).toString('hex');
            // On récupère les informations sur les items depuis l'API catalogue, on les insère dans la BD et on calcule le montant de la commande
            let montant = 0;
            await Promise.all(req.body.items.map(async (item) => {
                if (!(item.uri && validator.contains(item.uri, '/sandwichs/') && !isNaN(item.q)))
                    return next(500);
                response = await axios.get('http://catalogue:3000'+item.uri);
                await dbclient.query("INSERT INTO item (uri, libelle, tarif, quantite, command_id) VALUES ('"+item.uri+"', '"+response.data.sandwich.nom+"', '"+response.data.sandwich.prix+"', "+item.q+", '"+nouveauid+"')");
                montant += response.data.sandwich.prix * item.q;
            }));
            await dbclient.query("INSERT INTO commande (id, created_at, livraison, nom, mail, montant, token) VALUES ('"+nouveauid+"', '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', '"+moment(req.body.livraison.date+' '+req.body.livraison.heure, 'D-MM-YYYY HH:mm', true).format('YYYY-MM-DD HH:mm:ss')+"', '"+validator.escape(req.body.nom)+"', '"+req.body.mail+"', "+montant+", '"+token+"')");
            const items = await dbclient.all("SELECT uri, libelle, tarif, quantite FROM item WHERE command_id = '"+nouveauid+"'");
            const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant, token FROM commande WHERE id = '"+nouveauid+"'");
            if (items && commande) {
                res.set('Location', '/commandes/'+nouveauid);
                return res.status(201).json({
                    type: 'resource',
                    links: {
                        self: '/commandes/'+nouveauid,
                        items: '/commandes/'+nouveauid+'/items',
                    },
                    commande: {
                        nom: commande.nom,
                        mail: commande.mail,
                        livraison: {
                            date: moment(commande.livraison, 'YYYY-MM-DD HH:mm:ss', true).format('D-MM-YYYY'),
                            heure: moment(commande.livraison, 'YYYY-MM-DD HH:mm:ss', true).format('HH:mm')
                        },
                        id: commande.id,
                        token: commande.token,
                        montant: commande.montant,
                        items: items
                    }
                });
            }
            return handler404(res);
        } else
            return next(500);
    } catch(err) {
        next(500);
    }
}).all(handler405);

router.get('/:id', async (req, res, next) => {
    try {
        let token = '';
        if (req.query.token)
            token = req.query.token;
        else if (req.header('X-lbs-token'))
            token = req.header('X-lbs-token');
        const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant, status FROM commande WHERE id = '"+req.params.id+"' AND token = '"+token+"'");
        if (commande)
            return res.json({
                type: 'resource',
                commande: {
                    id: commande.id,
                    mail_client: commande.mail,
                    nom_client: commande.nom,
                    date_commande: commande.created_at,
                    date_livraison: commande.livraison,
                    montant: commande.montant,
                    statut: commande.status
                }
            });
        return handler404(res);
    } catch(err) {
        next(500);
    }
}).all(handler405);

router.post('/:id/payment', jsonparser, async (req, res, next) => {
    try {
        let token = '';
        if (req.query.token)
            token = req.query.token;
        else if (req.header('X-lbs-token'))
            token = req.header('X-lbs-token');
        if (req.body.carte_bleue && validator.isCreditCard(req.body.carte_bleue) && req.body.fidelisation.id_carte && validator.isAscii(req.body.fidelisation.id_carte) && req.body.fidelisation.token && validator.isJWT(req.body.fidelisation.token)) {
            const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant FROM commande WHERE id = '"+req.params.id+"' AND token = '"+token+"'");
            if (commande) {
                // La commande change le statut
                await dbclient.query("UPDATE commande SET ref_paiement = '"+crypto.randomBytes(48).toString('hex')+"', date_paiement = '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', mode_paiement = 1, status = 2 WHERE id = '"+commande.id+"'");
                // Enregistrement auprès du service de fidélisation
                await axios.post('http://fidelisation:3000/cartes/'+validator.escape(req.body.fidelisation.id_carte), {
                    montant: commande.montant
                }, {
                    headers: {
                        'Authorization': 'Bearer '+req.body.fidelisation.token
                    }
                });
                return res.json({
                    type: 'resource',
                    commande: {
                        id: commande.id,
                        mail_client: commande.mail,
                        nom_client: commande.nom,
                        date_commande: commande.created_at,
                        date_livraison: commande.livraison,
                        montant: commande.montant
                    }
                });
            } else
                return handler404(res);
        } else
            return next(500);
    } catch(err) {
        next(500);
    }
}).all(handler405);

module.exports = router;
