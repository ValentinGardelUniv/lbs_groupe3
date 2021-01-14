## Pour importer les données dans *mysql*
Tout simplement passer par le GUI de l'Adminer pour l'instant !
## Pour importer les données dans *mongo*
`docker-compose exec mongo mongoimport --username #NOMUTILISATEUR --password #MDPUTILISATEUR --db #NOMDB --collection categories --file /var/schema/categories.json --jsonArray`\
`docker-compose exec mongo mongoimport --username #NOMUTILISATEUR --password #MDPUTILISATEUR --db #NOMDB --collection sandwichs --file /var/schema/sandwichs.json --jsonArray`
