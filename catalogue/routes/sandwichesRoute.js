const express = require('express');
const Category = require('../models/Category.js');
const router = express.Router();

const Sandwich=require('../models/Sandwich.js');

function mapSandwichs(sandwichs, count, page, size, category){
   sandwichs = sandwichs.map(sandwich=>{
      return {
         sandwich: {
            ref: sandwich.ref,
            nom: sandwich.nom,
            type_pain: sandwich.type_pain,
            prix: sandwich.prix,
            categories: sandwich.categories
         },
         links:{
               self: {
                  href:"/sandwichs/"+sandwich.ref
               },
               categories: {
                  href: "/sandwichs/"+sandwich.ref+"/categories"
               }
         }
      };
   });
   let result = {
      type: "collection",
      count: count,
      size: sandwichs.length,
      date: new Date().toLocaleDateString(),
      sandwichs: sandwichs
     };
     if(page!=undefined){
        /** last page if pagination ON */
         let lastPage=Math.ceil(count/size);
         result.links = {
            next: {href:"/sandwichs/?page="+((page+1>lastPage)?lastPage:page+1)+"&size="+size+(category)?"&t="+category:""},
            prev: {href:"/sandwichs/?page="+((page-1<1)?1:page-1)+"&size="+size+(category)?"&t="+category:""},
            last: {href:"/sandwichs/?page="+lastPage+"&size="+size+(category)?"&t="+category:""},
            first: {href:"/sandwichs/?page=1&size="+size+(category)?"&t="+category:""}
         };
     }
   return result;
}

async function getSandwichs(category, page, size=2){
   if(page!=undefined && page<1)page=1;
   if(size != undefined && size<1)size=1;

   /** size of all query */
   let count=(category)?await Sandwich.find({categories: category}).count():await Sandwich.count();
   /** sandwichs objects*/
   let sandwichs;
   
   if(category==undefined && page===undefined){
      sandwichs = await Sandwich.find().sort("nom");
   }
   else if(category!=undefined) {
      if(page===undefined)
         sandwichs = await Sandwich.find({categories: category}).sort("nom");
      else {
         sandwichs = await Sandwich.find({categories: category}).sort("nom").limit(size*1).skip((page-1)*size);
      }
   }
   else {
      sandwichs = await Sandwich.find().sort("nom").limit(size*1).skip((page-1)*size);
   }



   if(sandwichs){
      return mapSandwichs(sandwichs, count, page, size, category);
   }
   else
      return false;
}

router.get('/', async (req, res)=>{
    let sandwichs=await getSandwichs(req.query.t, req.query.page, req.query.size);
    if(sandwichs){
       return res.status(200).json(sandwichs);
    }
    else
      res.status(404).send("Not Found");
});

router.get('/:ref', async (req, res)=>{
   let sandwich=await Sandwich.findOne({ref:req.params.ref});

   if(sandwich){
      return res.status(200).json({
      type: "resource",
      sandwich: {
         ref: sandwich.ref,
         nom: sandwich.nom,
         type_pain: sandwich.type_pain,
         prix: sandwich.prix
      },
      links:{
            self: {
               href:"/sandwichs/"+sandwich.ref
            },
            categories: {
               href: "/sandwichs/"+sandwich.ref+"/categories"
            }
         }
      });
   }
   else
      res.status(404).send("Not Found");
});

router.get('/:ref/categories', async (req, res)=>{
   let sandwich=await Sandwich.findOne({ref:req.params.ref});
    if(sandwich){
       let categories = await Category.find({nom: sandwich.categories});
       return res.status(200).json({
         type: "resource",
         sandwich: {
            ref: sandwich.ref,
            nom: sandwich.nom,
            type_pain: sandwich.type_pain,
            prix: sandwich.prix,
            categories: categories.map((category)=>{
               return {
                  category: {
                     id: category.id,
                     nom: category.nom,
                     description: category.description
                  },
                  links: {
                     self: {href: "/categories/"+category.id}
                  }
               };
            })
         },
         links:{
               self: {
                  href:"/sandwichs/"+sandwich.ref
               },
               categories: {
                  href: "/sandwichs/"+sandwich.ref+"/categories"
               }
            }
         });
    }
    else
      res.status(404).send("Not Found");
});

 module.exports = router;