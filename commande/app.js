const Command=require('./Command.js');

const express = require('express');
const app = express();
const port=process.env.LOCAL_PORT //3000

const con=require('./DBConnection.js');

async function getCommands(status, page, size){
   /*let result;
   let promise = await con.getConnection()
      .then(async (con)=>{
         await con.query("SELECT * FROM commande LIMIT 50").then((rows)=>{
            //console.log(rows);
            con.end();
            result = rows;
         }).catch((error)=>{
            console.error(error);
            con.end();
         });
      })
      .catch((error)=>{
         console.error(error);
      });
   return result;*/
   
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

/**
 * Liste des commandes
 * /commandes?status&page&size
 */
app.get('/commandes', async (req, res)=>{
   let commandes = await getCommands(req.query.status, req.query.page, req.query.size);
   console.log(commandes);
   res.json({
      type: "collection",
      count: commandes.length,
      commandes: commandes
   });
});

app.get('/commandes/:id', async (req, res)=>{
   let commande = await getCommand(req.params.id);
   if(commande)
      res.json(commande);
   else
      res.status(404).send("Commande introuvable");
});

app.put("/commandes/:id/:status", async (req, res)=>{
   let success = await updateCommandStatus(req.params.id, req.params.status);
   if(success)
      res.status(202).send("Status de la commande modifié");
   else
      res.status(404).send("Opération impossible");
});

app.use(function(err, req, res, next){
   res.status(400);
});

app.listen(port);