const express = require('express');
const moment = require('moment');

const router = express.Router();

const handler404 = require('../utils/handler404');
const handler405 = require('../utils/handler405');
const dbclient = require('../utils/DBClient');

router.get('/', async (req, res, next) => {
    try {
        const commandes = await dbclient.all('SELECT id, livraison, created_at, mail, status FROM commande');
        if (commandes) {
            let dateaujourdhui = new Date();
            let journeeaujourdhui = dateaujourdhui.getDate();
            if (journeeaujourdhui < 10)
                journeeaujourdhui = '0' + journeeaujourdhui;
            let moisaujourdhui = dateaujourdhui.getMonth() + 1;
            if (moisaujourdhui < 10)
                moisaujourdhui = '0' + moisaujourdhui;
            // Première itération pour le filtrage
            let commandespreparees = [];
            commandes.forEach((commande) => {
                if (req.query.status && commande.status !== parseInt(req.query.status))
                    return;
                commandespreparees.push({
                    commande: {
                        id: commande.id,
                        livraison: commande.livraison,
                        mail_client: commande.mail,
                        date_commande: commande.created_at,
                        statut: commande.status
                    },
                    links: {
                        self: {
                            href: '/commandes/' + commande.id
                        }
                    }
                });
            });
            // Tri par date de livraison et par l'ordre de création
            commandespreparees.sort(function(a, b) {
                let difference = moment(a.commande.livraison) - moment(b.commande.livraison);
                if (difference !== 0)
                    return difference;
                else
                    moment(a.commande.date_commande) - moment(b.commande.date_commande);
            });
            // Nombre de sandwichs à afficher sur une seule page
            let commandesparpage = 10;
            if (commandespreparees.length <= commandesparpage && !req.query.size && !req.query.page)
                return res.json({
                    type: 'collection',
                    count: commandespreparees.length,
                    date: journeeaujourdhui + '-' + moisaujourdhui + '-' + dateaujourdhui.getFullYear(),
                    commandes: commandespreparees
                });
            // Deuxième itération pour effectuer la pagination
            let commandesprepareespaginees = [];
            // Définition de la taille d'une page
            if (req.query.size)
                commandesparpage = req.query.size;
            let numeropagedemandee;
            // Tests sur le numéro de la page demandée
            if (req.query.page) {
                if (req.query.page <= 0)
                    numeropagedemandee = 1;
                else if (req.query.page > Math.ceil(commandesprepares.length/commandesparpage))
                    numeropagedemandee = Math.ceil(commandesprepares.length/commandesparpage);
                else
                    numeropagedemandee = req.query.page;
            } else
                numeropagedemandee = 1;
            commandesprepares.forEach((commandepreparee, clecommandepreparee) => {
                if (clecommandepreparee >= numeropagedemandee * commandesparpage || clecommandepreparee < (numeropagedemandee-1) * commandesparpage)
                    return;
                commandesprepareespaginees.push(commandepreparee);
            });
            // Précalculation des valeurs pour les mettre dans les liens
            let numeropageprecedente = numeropagedemandee;
            if (numeropageprecedente > 1)
                numeropageprecedente--;
            let numeropagesuivante = numeropagedemandee;
            if (numeropagesuivante < Math.ceil(commandesprepares.length/commandesparpage))
                numeropagesuivante++;
            return res.json({
                type: 'collection',
                count: commandesprepares.length,
                size: commandesprepareespaginees.length,
                links: {
                    next: {
                        href: '/commandes?page=' + numeropagesuivante + '&size=' + commandesparpage
                    },
                    prev: {
                        href: '/commandes?page=' + numeropageprecedente + '&size=' + commandesparpage
                    },
                    last: {
                        href: '/commandes?page=' + Math.ceil(commandesprepares.length/commandesparpage) + '&size=' + commandesparpage
                    },
                    first: {
                        href: '/commandes?page=1&size=' + commandesparpage
                    }
                },
                date: journeeaujourdhui + '-' + moisaujourdhui + '-' + dateaujourdhui.getFullYear(),
                commandes: commandesprepareespaginees
            });
        }
        return handler404(res);
    } catch(err) {
        next(500);
    }
}).all(handler405);

router.get('/:id', async (req, res, next) => {
    try {
        const commande = await dbclient.one("SELECT id, livraison, created_at, mail, status FROM commande WHERE id = '"+req.params.id+"'");
        if (commande) {
            const items = await dbclient.one("SELECT uri, libelle, quantite FROM item WHERE command_id = '"+req.params.id+"'");
            if (!items)
                return handler404(res);
            return res.json({
                type: 'resource',
                links: {
                    self: {
                        href: '/commandes/' + commande.id
                    }
                },
                commande: {
                    id: commande.id,
                    livraison: commande.livraison,
                    mail_client: commande.mail,
                    date_commande: commande.created_at,
                    statut: commande.status,
                    items: items
                }
            });
        }
        return handler404(res);
    } catch(err) {
        next(500);
    }
}).all(handler405);

router.put('/:id/:status', async (req, res, next) => {
    try {
        await dbclient.query("UPDATE commande SET status = "+req.params.status+" WHERE id = '"+req.params.id+"'");
        const commande = await dbclient.one("SELECT id, livraison, created_at, mail, status FROM commande WHERE id = '"+req.params.id+"'");
        if (commande) {
            if (commande.status !== parseInt(req.params.status))
                return next(500);
            return res.json({
                type: 'resource',
                links: {
                    self: {
                        href: '/commandes/' + commande.id
                    }
                },
                commande: {
                    id: commande.id,
                    livraison: commande.livraison,
                    mail_client: commande.mail,
                    date_commande: commande.created_at,
                    statut: commande.status
                }
            });
        }
        return handler404(res);
    } catch(err) {
        next(500);
    }
}).all(handler405);

module.exports = router;
