const express = require('express');
const router = express.Router();

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
 
async function updateCommandStatus(id, status) {
    if(typeof status != "number")
       return false;
    let conn = await con.getConnection();
    let result = await conn.query("UPDATE commande SET status=? WHERE id=?",[status, id]);
    console.log(result);
    return result.affectedRows===1;
 }

async function insertCommand(body) {
    if(body!=null)
    {
        let nom=body.nom;
        let mail=body.mail;
        let livraison=body.date;
        let id= uuid.v4();
        console.log("id v4 random:", id);
        while(await getCommand(id)){
            id = uuid.v4();
            console.log("id already exists, new id:", id);
        }

        let conn = await con.getConnection();
        let result = await conn.query("INSERT INTO commande(id, nom, mail, livraison) VALUES(?, ?, ?, ?)",[id, nom, mail, livraison]);
        
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
    console.log(commandes);
    res.json({
       type: "collection",
       count: commandes.length,
       commandes: commandes
    });
 });
 
 router.get('/:id', async (req, res)=>{
    let commande = await getCommand(req.params.id);
    if(commande)
       res.json(commande);
    else
      res.status(404).send("Commande introuvable");
 });
 
 router.put("/:id/:status", async (req, res)=>{
    let success = await updateCommandStatus(req.params.id, req.params.status);
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
            commande: commande
        });
    }
    else
       res.status(404).send("Opération impossible");
});

 module.exports = router;