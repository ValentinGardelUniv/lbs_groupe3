const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

var uuid = require("uuid");

const con=require('../DBConnection.js');

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
     let result = await conn.query("SELECT * FROM commande where id like ?",[id]);
     
     return result[0];

   }
 async function getCommandByToken(id, token) {
    if(token){
      let conn = await con.getConnection();
      let command = await conn.query("SELECT * FROM commande where id like ?",[id]);
      command =command[0];

      if(command && command.token===token)
         return command;
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

async function insertCommand(body) {
    if(body!=null && body.nom!=null && body.mail!=null && body.date!=null)
    {
        let nom=body.nom;
        let mail=body.mail;
        let livraison=body.date;
        let id= uuid.v4();
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
        
        if(result.affectedRows>0)
            return await getCommand(id);
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
    if(commande)
       res.json({
          type: "resource",
          command: {
             id: commande.id,
             livraison: commande.livraison,
             nom: commande.nom,
             mail: commande.mail,
             montant: commande.montant,
             token: commande.token,
             status: commande.status
          },
          links: {
             self: {href: "/commands/"+commande.id+"?token="+commande.token}
          }
         });
    else
      res.status(404).send("Commande introuvable");
 });
 
 router.get('/:id/items', async (req, res)=>{
     res.status(404).send("To Implement");
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
        res.status(201).setHeader("Location", req.headers.host+"/commandes/"+commande.id).json({
            type: "ressource",
            commande: {
               nom: commande.nom,
               mail: commande.mail,
               livraison: commande.livraison,
               id: commande.id,
               token: commande.token,
               montant: commande.montant
            }
        });
    }
    else
       res.status(404).send("Opération impossible");
});

 module.exports = router;