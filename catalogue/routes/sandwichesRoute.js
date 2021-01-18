const express = require('express');
const router = express.Router();

const Sandwich=require('../models/Sandwich.js');

function mapSandwiches(sandwiches, count, host, page, size, category){
   sandwiches = sandwiches.map(sandwich=>{
      return {
        sandwich: {
           ref: sandwich.ref,
           nom: sandwich.nom,
           type_pain: sandwich.type_pain,
           prix: sandwich.prix
        },
        links: {
           self: {href: host+"/sandwiches/"+sandwich.ref}
        }
      }
   });
   let result = {
      type: "collection",
      count: count,
      size: sandwiches.length,
      date: new Date().toLocaleDateString(),
      sandwiches: sandwiches
     };
     if(page!=undefined){
        /** last page if pagination ON */
         let lastPage=Math.ceil(count/size);
         result.links = {
            next: {href:host+"/sandwiches/?page="+((page+1>lastPage)?lastPage:page+1)+"&size="+size+(category)?"&t="+category:""},
            prev: {href:host+"/sandwiches/?page="+((page-1<1)?1:page-1)+"&size="+size+(category)?"&t="+category:""},
            last: {href:host+"/sandwiches/?page="+lastPage+"&size="+size+(category)?"&t="+category:""},
            first: {href:host+"/sandwiches/?page=1&size="+size+(category)?"&t="+category:""}
         };
     }
   return result;
}

async function getSandwiches(host, category, page, size=2){
   if(page!=undefined && page<1)page=1;
   if(size != undefined && size<1)size=1;

   /** size of all query */
   let count=(category)?await Sandwich.find({categories: category}).count():await Sandwich.count();
   /** sandwiches objects*/
   let sandwiches;
   
   if(category==undefined && page===undefined){
      sandwiches = await Sandwich.find().sort("nom");
   }
   else if(category!=undefined) {
      if(page===undefined)
         sandwiches = await Sandwich.find({categories: category}).sort("nom");
      else {
         sandwiches = await Sandwich.find({categories: category}).sort("nom").limit(size*1).skip((page-1)*size);
      }
   }
   else {
      sandwiches = await Sandwich.find().sort("nom").limit(size*1).skip((page-1)*size);
   }



   if(sandwiches){
      return mapSandwiches(sandwiches, count, host, page, size, category);
   }
   else
      return false;
}

async function getSandwich(ref){
   let sandwich = await Sandwich.where("ref="+ref);
   if(sandwich){
      return sandwich;
   }
   else
      return false;
}

router.get('/', async (req, res)=>{
    let sandwiches=await getSandwiches(req.headers.host, req.query.t, req.query.page, req.query.size);
    if(sandwiches){
       return res.status(200).json(sandwiches);
    }
    else
      res.status(404).send("Not Found");
});

router.get('/:ref', async (req, res)=>{
   let sandwich=await getSandwich(req.params.ref);
    if(sandwich){
       return res.status(200).json(sandwich);
    }
    else
      res.status(404).send("Not Found");
});

 module.exports = router;