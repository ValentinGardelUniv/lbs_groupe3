const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const uuid = require("uuid");
const con = require('../DBConnection.js');
const axios = require('axios');

axios.defaults.baseURL = "http://api.catalogue:3000";//"http://172.20.0.6:3000";
axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

async function getCommands(status, page, size){
   let conn = await con.getConnection();
   let query=  "SELECT * FROM commande";
   let params=[];

   if(status && typeof status === "number") {
      status=parseInt(status);
      query += " WHERE status = ?";
      params.push(status);
   }

   if(size && typeof size === "number" && page && typeof page === "number"){
      query += " LIMIT ?, ?";
      page=parseInt(page);
      size=parseInt(size);
      params.push((page>1)?(((page-1)*size)-1):(0));
      params.push(size);
   }

   query+=" ORDER BY created_at, livraison DESC;";
   console.log("QUERY: "+query+", PARAMS: "+params);
   let result = await conn.query(query, params);
      
   return result;
}

async function getCommand(id) {
   let conn = await con.getConnection();
   let result = await conn.query("SELECT * FROM commande WHERE commande.id LIKE ?",[id]);
   conn.end();
   return result[0];

}

async function getCommandItems(id) {
   let conn = await con.getConnection();
   let result = await conn.query("SELECT * FROM item WHERE command_id = ?",[id]);

   return result.map((item)=>{
      return {
         uri: item.uri,
         q: item.quantite
      };
   });
}

async function getCommandByToken(id, token) {
   if(token){
      let conn = await con.getConnection();
      let command = await conn.query("SELECT * FROM commande where id like ?",[id]);
      command =command[0];

      if(command && command.token===token){
         return command;
      }
      else
         return false;
   }
   else
      return false;
}
 
async function updateCommandStatus(id, status) {
    if(typeof status === "number"){
      let conn = await con.getConnection();
      let result = await conn.query("UPDATE commande SET status=? WHERE id=?;",[status, id]);
      //console.log(result);
      return result.affectedRows===1; 
   }
    else
       return false;
}

async function insertItems(items, commande_id){
   let montanttotal=-1;
   if(items!=null && commande_id!=null){
      for(const item of items){

         let uri=item.uri;
         let libelle, montant;
         let quantite=item.q;

         try{
            let response = await axios.get(uri);
            
            //console.log({response});

            libelle=response.data.sandwich.nom;
            montant=response.data.sandwich.prix;
            montanttotal+= montant*quantite;
            let conn = await con.getConnection();
            await conn.query("INSERT INTO item(uri, libelle, tarif, quantite, command_id) VALUES(?, ?, ?, ?, ?)",[uri, libelle, montant, quantite, commande_id]);
            conn.end();
         }catch(error){
            console.log(error);
         }
      }
   }
   return montanttotal;
}

async function insertCommand(body) {
    if(body!=null && body.nom!=null && body.mail!=null && body.livraison!=null&& body.livraison.date!=null&& body.livraison.heure!=null && body.items!=null)
    {
        let nom=body.nom;
        let mail=body.mail;
        let livraison=body.livraison.date+" "+body.livraison.heure;
        console.log("livraison:", livraison);
        let id= uuid.v4();
        let items=body.items;

        //console.log("id v4 random:", id);
        while(await getCommand(id)){
            id = uuid.v4();
            console.log("id already exists, new id:", id);
        }
        let token= jwt.sign({nom: nom}, id);
        //console.log({token});
        let montant=0;

        let conn = await con.getConnection();
        let result = await conn.query("INSERT INTO commande(id, nom, mail, livraison, token, montant) VALUES(?, ?, ?, ?, ?, ?)",[id, nom, mail, livraison, token, montant]);
        conn.end();
        if(result.affectedRows>0) {
           montant = await insertItems(items, id);
            console.log("montant:", montant);
           let conn = await con.getConnection();
           await conn.query("UPDATE commande SET montant=? WHERE id=?",[montant, id]);
           conn.end();

           return await getCommand(id);
        }
        else
            return false;
    }
    else
        return false;
}
 /**
 * Liste des commandes
 * /commandes?status&page&size
 */
router.get('/', async (req, res)=>{
    let commandes = await getCommands(req.query.status, req.query.page, req.query.size);
    //console.log(commandes);
    res.json({
       type: "collection",
       count: commandes.length,
       commandes: commandes
    });
});
 
router.get('/:id', async (req, res)=>{
    let commande = await getCommandByToken(req.params.id, (req.query.token)?req.query.token:req.header('X-lbs-token'));
    if(commande) {
      let items = await getCommandItems(commande.id);
      res.json({
         type: "resource",
         command: {
            id: commande.id,
            livraison: commande.livraison,
            nom: commande.nom,
            mail: commande.mail,
            montant: commande.montant,
            token: commande.token,
            items:items,
            status: commande.status
         },
         links: {
            self: {href: "/commands/"+commande.id+"?token="+commande.token}
         }
      });
   }
   else
      res.status(404).send("Commande introuvable");
});

router.put("/:id/:status", async (req, res)=>{
    let success = await updateCommandStatus(req.params.id, Number.parseInt(req.params.status));
    if(success)
       res.status(202).send("Status de la commande modifié");
    else
       res.status(404).send("Opération impossible");
 });

router.post('/', async (req, res)=>{
    let commande = await insertCommand(req.body);
    if(commande)
    {
      let items = await getCommandItems(commande.id);
      res.status(201).setHeader("Location", /*req.headers.host+*/"/commandes/"+commande.id).json({
         type: "ressource",
         commande: {
            nom: commande.nom,
            mail: commande.mail,
            livraison: {
               date: new Date(commande.livraison).toDateString(),
               heure: new Date(commande.livraison).toTimeString()
            },
            id: commande.id,
            token: commande.token,
            items: items,
            montant: commande.montant
         }
      });
    }
    else
      res.status(404).send("Opération impossible");
});

module.exports = router;