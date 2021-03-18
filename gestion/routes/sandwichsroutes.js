const express = require('express');

const router = express.Router();

const handler404 = require('../utils/handler404');
const handler405 = require('../utils/handler405');
const Sandwich = require('../models/Sandwich');
const Categorie = require('../models/Categorie');

router.get('/', async (req, res, next) => {
    let sandwichs = [];
    try {
        sandwichs = await Sandwich.find({});
        if (sandwichs) {
            let dateaujourdhui = new Date();
            let journeeaujourdhui = dateaujourdhui.getDate();
            if (journeeaujourdhui < 10)
                journeeaujourdhui = '0' + journeeaujourdhui;
            let moisaujourdhui = dateaujourdhui.getMonth() + 1;
                if (moisaujourdhui < 10)
                    moisaujourdhui = '0' + moisaujourdhui;
            // Première itération pour donner la forme et le filtrage
            let sandwichsprepares = [];
            sandwichs.forEach((sandwich) => {
                if (req.query.t && sandwich.type_pain !== req.query.t)
                    return;
                if (req.query.c && !sandwich.categories.includes(req.query.c))
                    return;
                sandwichsprepares.push({
                    sandwich: {
                        ref: sandwich.ref,
                        nom: sandwich.nom,
                        type_pain: sandwich.type_pain,
                        prix: parseFloat(sandwich.prix)
                    },
                    links: {
                        self: {
                            href: '/sandwichs/' + sandwich.ref
                        }
                    }
                });
            });
            // Nombre de sandwichs à afficher sur une seule page
            let sandwichsparpage = 10;
            if (sandwichsprepares.length <= sandwichsparpage && !req.query.size && !req.query.page)
                return res.json({
                    type: 'collection',
                    count: sandwichsprepares.length,
                    date: journeeaujourdhui + '-' + moisaujourdhui + '-' + dateaujourdhui.getFullYear(),
                    sandwichs: sandwichsprepares
                });
            // Deuxième itération pour effectuer la pagination
            let sandwichspreparespagines = [];
            // Définition de la taille d'une page
            if (req.query.size)
                sandwichsparpage = req.query.size;
            let numeropagedemandee;
            // Tests sur le numéro de la page demandée
            if (req.query.page) {
                if (req.query.page <= 0)
                    numeropagedemandee = 1;
                else if (req.query.page > Math.ceil(sandwichsprepares.length/sandwichsparpage))
                    numeropagedemandee = Math.ceil(sandwichsprepares.length/sandwichsparpage);
                else
                    numeropagedemandee = req.query.page;
            } else
                numeropagedemandee = 1;
            sandwichsprepares.forEach((sandwichprepare, clesandwichprepare) => {
                if (clesandwichprepare >= numeropagedemandee * sandwichsparpage || clesandwichprepare < (numeropagedemandee-1) * sandwichsparpage)
                    return;
                sandwichspreparespagines.push(sandwichprepare);
            });
            // Précalculation des valeurs pour les mettre dans les liens
            let numeropageprecedente = numeropagedemandee;
            if (numeropageprecedente > 1)
                numeropageprecedente--;
            let numeropagesuivante = numeropagedemandee;
            if (numeropagesuivante < Math.ceil(sandwichsprepares.length/sandwichsparpage))
                numeropagesuivante++;
            return res.json({
                type: 'collection',
                count: sandwichsprepares.length,
                size: sandwichspreparespagines.length,
                links: {
                    next: {
                        href: '/sandwichs?page=' + numeropagesuivante + '&size=' + sandwichsparpage
                    },
                    prev: {
                        href: '/sandwichs?page=' + numeropageprecedente + '&size=' + sandwichsparpage
                    },
                    last: {
                        href: '/sandwichs?page=' + Math.ceil(sandwichsprepares.length/sandwichsparpage) + '&size=' + sandwichsparpage
                    },
                    first: {
                        href: '/sandwichs?page=1&size=' + sandwichsparpage
                    }
                },
                date: journeeaujourdhui + '-' + moisaujourdhui + '-' + dateaujourdhui.getFullYear(),
                sandwichs: sandwichspreparespagines
            });
        }
        return handler404(res);
    } catch (err) {
        next(500);
    }
}).all(handler405);

router.get('/:ref', async (req, res, next) => {
    let sandwich = [];
    try {
        sandwich = await Sandwich.findOne({
            ref: req.params.ref
        });
        if (sandwich) {
            categories = await Categorie.find({
                nom: sandwich.categories
            });
            if (categories)
                categories.forEach((categorie, clecategorie) => {
                    sandwich.categories[clecategorie] = {
                        id: categorie.id,
                        nom: categorie.nom
                    };
                });
            return res.json({
                type: 'resource',
                links: {
                    self: {
                        href: '/sandwichs/'+req.params.ref
                    }
                },
                sandwich: {
                    ref: sandwich.ref,
                    nom: sandwich.nom,
                    description: sandwich.description,
                    type_pain: sandwich.type_pain,
                    categories: sandwich.categories,
                    prix: parseFloat(sandwich.prix)
                }
            });
        }
    } catch (err) {
        next(500);
    }
}).all(handler405);

module.exports = router;
