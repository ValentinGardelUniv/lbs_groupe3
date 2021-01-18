const express = require('express');

const router = express.Router();

const Sandwich = require("../models/Sandwich");

router.get('/', async (req, res, next) => {
    let sandwichs = [];
    try {
        sandwichs = await Sandwich.find({});
        let dateaujourdhui = new Date();
        let journeeaujourdhui = dateaujourdhui.getDate();
        if (journeeaujourdhui < 10)
            journeeaujourdhui = "0" + journeeaujourdhui;
        let moisaujourdhui = dateaujourdhui.getMonth() + 1;
            if (moisaujourdhui < 10)
                moisaujourdhui = "0" + moisaujourdhui;
        let sandwichsprepares = [];
        // Première itération pour donner la forme et le filtrage
        sandwichs.forEach((sandwich) => {
            if (req.query.t && sandwich.type_pain !== req.query.t)
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
                        href: "/sandwichs/" + sandwich.ref
                    }
                }
            });
        });
        let sandwichspreparespagines = [];
        // Deuxième itération pour effectuer la pagination
        if (req.query.page) {
            let sandwichsparpage = 10;
            // Définition de la taille d'une page
            if (req.query.size)
                sandwichsparpage = req.query.size;
            let numeropagedemandee;
            // Tests sur le numéro de la page demandée
            if (req.query.page <= 0)
                numeropagedemandee = 1;
            else if (req.query.page > Math.ceil(sandwichsprepares.length/sandwichsparpage))
                numeropagedemandee = Math.ceil(sandwichsprepares.length/sandwichsparpage);
            else
                numeropagedemandee = req.query.page;
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
                type: "collection",
                count: sandwichsprepares.length,
                size: sandwichspreparespagines.length,
                links: {
                    next: {
                        href: "/sandwichs?page=" + numeropagesuivante + "&size=" + sandwichsparpage
                    },
                    prev: {
                        href: "/sandwichs?page=" + numeropageprecedente + "&size=" + sandwichsparpage
                    },
                    last: {
                        href: "/sandwichs?page=" + Math.ceil(sandwichsprepares.length/sandwichsparpage) + "&size=" + sandwichsparpage
                    },
                    first: {
                        href: "/sandwichs?page=1&size=" + sandwichsparpage
                    }
                },
                date: journeeaujourdhui + "-" + moisaujourdhui + "-" + dateaujourdhui.getFullYear(),
                sandwichs: sandwichspreparespagines
            });
        }
        return res.json({
            type: "collection",
            count: sandwichsprepares.length,
            date: journeeaujourdhui + "-" + moisaujourdhui + "-" + dateaujourdhui.getFullYear(),
            sandwichs: sandwichsprepares
        });
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
});

module.exports = router;
