const express = require('express');
const bodyparser = require('body-parser');

const router = express.Router();
const jsonparser = bodyparser.json();

const handler404 = require('../utils/handler404');
const handler405 = require('../utils/handler405');
const Sandwich = require('../models/Sandwich');
const Categorie = require('../models/Categorie');

router.get('/', async (req, res, next) => {
    try {
        categories = await Categorie.find({});
        if (categories) {
            let sandwichsprepares = {};
            await Promise.all(categories.map(async (categorie) => {
                let sandwichs = await Sandwich.find({
                    categories: categorie.nom
                });
                sandwichs = sandwichs.map((sandwich) => {
                    return {
                        id: sandwich.ref,
                        nom: sandwich.nom,
                        type_pain: sandwich.type_pain,
                        prix: parseFloat(sandwich.prix)
                    }
                });
                sandwichsprepares[categorie.nom] = sandwichs;
            }));
            return res.json({
                type: 'collection',
                sandwichs: sandwichsprepares
            });
        }
        return handler404(res);
    } catch (err) {
        next(500);
    }
}).post('/', jsonparser, async (req, res, next) => {
    try {
        let sandwich = await Sandwich.create(req.body);
        return res.json({
            type: 'resource',
            sandwich: {
                ref: sandwich.ref,
                nom: sandwich.nom,
                description: sandwich.description,
                type_pain: sandwich.type_pain,
                categories: sandwich.categories,
                prix: parseFloat(sandwich.prix)
            }
        });
    } catch (err) {
        next(500);
    }
}).all(handler405);

router.delete('/:ref', async (req, res, next) => {
    let sandwich = [];
    try {
        sandwich = await Sandwich.findOneAndDelete({
            ref: req.params.ref
        });
        if (sandwich) {
            return res.json({
                type: 'resource',
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
        return handler404(res);
    } catch (err) {
        next(500);
    }
}).put('/:ref', jsonparser, async (req, res, next) => {
    try {
        let sandwich = await Sandwich.findOneAndUpdate({
            ref: req.params.ref
        }, req.body);
        if (sandwich) {
            return res.json({
                type: 'resource',
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
        return handler404(res);
    } catch (err) {
        next(500);
    }
}).all(handler405);

module.exports = router;
