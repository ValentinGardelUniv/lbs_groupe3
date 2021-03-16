const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const handler401 = require('../utils/handler401');
const handler404 = require('../utils/handler404');
const handler405 = require('../utils/handler405');
const dbclient = require('../utils/DBClient');

router.post('/:id/auth', async (req, res, next) => {
    try {
        if (req.header('Authorization') && req.header('Authorization').startsWith('Basic ')) {
            const carte = await dbclient.one("SELECT id, mail_client, passwd FROM carte_fidelite WHERE id = '"+req.params.id+"'");
            if (carte) {
                let identifiants = Buffer.from(req.header('Authorization').replace('Basic ', ''), 'base64').toString('ascii').split(':');
                // Création de token si authentification réussie
                if (carte.mail_client === identifiants[0] && bcrypt.compareSync(identifiants[1], carte.passwd))
                    return res.json({
                        token: jwt.sign({
                            id: carte.id
                        }, process.env.PRIVATE_KEY, {
                            algorithm: 'HS256'
                        })
                    });
                else
                    return handler401(res);
            }
            return handler404(res);
        } else
            return handler401(res);
    } catch(err) {
        next(500);
    }
}).all(handler405);

router.get('/:id', async (req, res, next) => {
    try {
        if (req.header('Authorization') && req.header('Authorization').startsWith('Bearer')) {
            let token = req.header('Authorization').replace('Bearer ', '');
            let idcarte = '';
            jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
                if (err || decoded.id !== req.params.id)
                    return handler401(res);
                idcarte = decoded.id;
            });
            // On récupère les infos sur la carte car tous les tests validés
            const carte = await dbclient.one("SELECT id, nom_client, mail_client, cumul_achats, cumul_commandes FROM carte_fidelite WHERE id = '"+idcarte+"'");
            if (carte)
                return res.json({
                    type: 'resource',
                    carte: {
                        id: carte.id,
                        nom_client: carte.nom_client,
                        mail_client: carte.mail_client,
                        cumul_achats: carte.cumul_achats,
                        cumul_commandes: carte.cumul_commandes
                    }
                });
            return handler404(res);
        } else
            return handler401(res);
    } catch(err) {
        next(500);
    }
}).all(handler405);


module.exports = router;
