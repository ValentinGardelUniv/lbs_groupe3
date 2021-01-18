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
   let category=await Categories.find();
    if(category){
       console.dir(category);
       res.json(category);
    }
    else
      res.status(404).send("Not Found");
});

 module.exports = router;