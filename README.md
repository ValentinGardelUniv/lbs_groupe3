# *lbs_groupe3*
## Auteurs
 - David BARANIAK
## Fichiers à rajouter pour démarrer le projet
### *commande/.env.dev*
`LOCAL_PORT=3000`\
`DIST_PORT=3000`\
`MYSQL_HOST=commande-suivi_db`\
`MYSQL_DATABASE=#NOMDB`\
`MYSQL_USER=#NOMUTILISATEUR`\
`MYSQL_PASSWORD=#MDPUTILISATEUR`
### *suivi/.env.dev*
`LOCAL_PORT=3000`\
`DIST_PORT=3003`\
`MYSQL_HOST=commande-suivi_db`\
`MYSQL_DATABASE=#NOMDB`\
`MYSQL_USER=#NOMUTILISATEUR`\
`MYSQL_PASSWORD=#MDPUTILISATEUR`
### *commande-suivi_db/.env.dev*
`MYSQL_ROOT_PASSWORD=#MDPADMINISTRATEUR`\
`MYSQL_DATABASE=#NOMDB`\
`MYSQL_USER=#NOMUTILISATEUR`\
`MYSQL_PASSWORD=#MDPUTILISATEUR`
### *fidelisation/.env.dev*
`LOCAL_PORT=3000`\
`DIST_PORT=3002`\
`MYSQL_HOST=fidelisation_db`\
`MYSQL_DATABASE=#NOMDB`\
`MYSQL_USER=#NOMUTILISATEUR`\
`MYSQL_PASSWORD=#MDPUTILISATEUR`\
`PRIVATE_KEY=#KEYJWT`
### *fidelisation_db/.env.dev*
`MYSQL_ROOT_PASSWORD=#MDPADMINISTRATEUR`\
`MYSQL_DATABASE=#NOMDB`\
`MYSQL_USER=#NOMUTILISATEUR`\
`MYSQL_PASSWORD=#MDPUTILISATEUR`
### *catalogue/.env.dev*
`LOCAL_PORT=3000`\
`DIST_PORT=3001`\
`MONGO_HOST=catalogue-gestion_db`\
`MONGO_DATABASE=#NOMDB`\
`MONGO_USER=#NOMUTILISATEUR`\
`MONGO_PASSWORD=#MDPUTILISATEUR`
### *gestion/.env.dev*
`LOCAL_PORT=3000`\
`DIST_PORT=3004`\
`MONGO_HOST=catalogue-gestion_db`\
`MONGO_DATABASE=#NOMDB`\
`MONGO_USER=#NOMUTILISATEUR`\
`MONGO_PASSWORD=#MDPUTILISATEUR`
### *catalogue-gestion_db/.env.dev*
`MONGO_INITDB_ROOT_USERNAME=#NOMADMINISTRATEUR`\
`MONGO_INITDB_ROOT_PASSWORD=#MDPADMINISTRATEUR`\
`MONGO_INITDB_DATABASE=#NOMDB`
### *catalogue-gestion_db/init-mongo.js*
`db.createUser({
    user: "#NOMUTILISATEUR",
    pwd: "#MDPUTILISATEUR",
    roles: [{
        role: "readWrite",
        db: "#NOMDB"
    }]
});`
### *mongo-express/.env.dev*
`ME_CONFIG_MONGODB_SERVER=catalogue-gestion_db`\
`ME_CONFIG_MONGODB_ENABLE_ADMIN=false`\
`ME_CONFIG_MONGODB_AUTH_DATABASE=#NOMDB`\
`ME_CONFIG_MONGODB_AUTH_USERNAME=#NOMUTILISATEUR`\
`ME_CONFIG_MONGODB_AUTH_PASSWORD=#MDPUTILISATEUR`
## Pour importer les données dans *mysql*
Tout simplement passer par le GUI de l'Adminer pour l'instant !
## Pour importer les données dans *mongo*
`docker-compose exec catalogue-gestion_db mongoimport --username #NOMUTILISATEUR --password #MDPUTILISATEUR --db #NOMDB --collection categories --file /var/schema/categories.json --jsonArray`\
`docker-compose exec catalogue-gestion_db mongoimport --username #NOMUTILISATEUR --password #MDPUTILISATEUR --db #NOMDB --collection sandwichs --file /var/schema/sandwichs.json --jsonArray`
## Pour démarrer le projet
`docker-compose up`
