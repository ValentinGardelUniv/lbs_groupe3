const express = require('express');
const router = express.Router();

const Categories=require('../models/Category.js');
const Sandwichs=require('../models/Sandwich.js');

router.get('/', async (req, res)=>{
    let categories=await Categories.find();
    if(categories){
       res.json({
          type: "collection",
          count: categories.length,
          date: new Date().toLocaleDateString(),
          categories: categories.map((category)=>{
            return {
               id: category.id,
               nom: category.nom,
               description: category.description
            };
          })
         });
    }
    else
      res.status(404).send("Not Found");
});

router.get('/:id', async (req, res)=>{
   let category=await Categories.findOne({id: req.params.id});
   //console.log(req.params.id);
   if(category){
       res.json({
          type: "resource",
          date: new Date().toLocaleDateString(),
          category: {
            id: category.id,
            nom: category.nom,
            description: category.description
          },
          links: {
             self: {href: "/categories/"+category.id},
             sandwichs: {href: "/categories/"+category.id+"/sandwichs"}
          }
       });
    }
    else
      res.status(404).send("Not Found");
});

router.get('/:id/sandwichs', async (req, res)=>{
   let category=await Categories.findOne({id: req.params.id});
   if(category){
      let sandwichs=await Sandwichs.find({categories: category.nom});
      if(sandwichs){
         //console.dir(sandwichs);
         res.json({
            type: "collection",
            count: sandwichs.length,
            sandwichs: sandwichs.map((sandwich)=>{
               return {
                  sandwich: {
                  ref: sandwich.ref,
                  nom: sandwich.nom,
                  description: sandwich.description,
                  prix: sandwich.prix
                  },
                  links: {
                     self: {href: "/sandwichs/"+sandwich.ref},
                     categories: {href: "/sandwichs/"+sandwich.ref+"/categories"}
                  }
               };
            })
         });
      }
   }
    else
      res.status(404).send("Not Found");
});

 module.exports = router;