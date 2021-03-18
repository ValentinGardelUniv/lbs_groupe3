const express = require('express');

const router = express.Router();

const handler404 = require('../utils/handler404');
const handler405 = require('../utils/handler405');
const Categorie = require('../models/Categorie');
const Sandwich = require('../models/Sandwich');

router.get('/:id', async (req, res, next) => {
    let categorie = [];
    try {
        categorie = await Categorie.findOne({
            id: req.params.id
        });
        if (categorie) {
            let dateaujourdhui = new Date();
            let journeeaujourdhui = dateaujourdhui.getDate();
            if (journeeaujourdhui < 10)
                journeeaujourdhui = '0' + journeeaujourdhui;
            let moisaujourdhui = dateaujourdhui.getMonth() + 1;
            if (moisaujourdhui < 10)
                moisaujourdhui = '0' + moisaujourdhui;
            return res.json({
                type: 'resource',
                date: journeeaujourdhui + '-' + moisaujourdhui + '-' + dateaujourdhui.getFullYear(),
                categorie: {
                    id: categorie.id,
                    nom: categorie.nom,
                    description: categorie.description
                },
                links: {
                    sandwichs: {
                        href: '/categories/'+req.params.id+'/sandwichs'
                    },
                    self: {
                        href: '/categories/'+req.params.id
                    }
                }
            });
        }
        return handler404(res);
    } catch (err) {
        console.error(err);
        next(500);
    }
}).all(handler405);

router.get('/:id/sandwichs', async (req, res, next) => {
    let categorie = [];
    try {
        categorie = await Categorie.findOne({
            id: req.params.id
        });
        if (categorie) {
            sandwichs = await Sandwich.find({
                categories: categorie.nom
            });
            if (sandwichs) {
                let dateaujourdhui = new Date();
                let journeeaujourdhui = dateaujourdhui.getDate();
                if (journeeaujourdhui < 10)
                    journeeaujourdhui = '0' + journeeaujourdhui;
                let moisaujourdhui = dateaujourdhui.getMonth() + 1;
                if (moisaujourdhui < 10)
                    moisaujourdhui = '0' + moisaujourdhui;
                // Première itération pour donner la forme
                let sandwichsprepares = [];
                sandwichs.forEach((sandwich) => {
                    if (sandwichsprepares.length >= 10)
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
                return res.json({
                    type: 'collection',
                    count: sandwichsprepares.length,
                    date: journeeaujourdhui + '-' + moisaujourdhui + '-' + dateaujourdhui.getFullYear(),
                    sandwichs: sandwichsprepares,
                    links: {
                        all: {
                            msg: 'Pour afficher la liste complète des sandwichs',
                            href: '/sandwichs?c='+categorie.nom
                        }
                    }
                });
            }
        }
        return handler404(res);
    } catch (err) {
        next(500);
    }
}).all(handler405);

module.exports = router;
