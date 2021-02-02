const express = require('express');
const router = express.Router();

const Categories=require('../models/Category.js');

router.get('/', async (req, res)=>{
    let categories=await Categories.find();
    if(categories){
       res.json({
          type: "collection",
          count: categories.length,
          date: new Date().toLocaleDateString(),
          categories: categories
         });
    }
    else
      res.status(404).send("Not Found");
});

router.get('/:id', async (req, res)=>{
   let category=await Categories.where("id="+req.params.id);
    if(category){
       console.dir(category);
       res.json(category.toJson());
    }
    else
      res.status(404).send("Not Found");
});

router.get('/:id/sandwichs', async (req, res)=>{
   let sandwichs=await Sandwichs.where(req.params.id+" in cateories");
    if(sandwichs){
       console.dir(sandwichs);
       res.json(sandwichs);
    }
    else
      res.status(404).send("Not Found");
});

 module.exports = router;