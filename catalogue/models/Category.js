const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    id: { type: Number, index: true, unique: true, required: true },
    nom: { type: String, required: true },
    description: { type: String, text: true }
});
/*
ex.toJson= (category)=>{
    return {
    type: "resource",
    date: new Date().toLocaleDateString(),
    categorie: category,
    links: {
       sandwichs: {
          href: "/categorie/"+req.params.id+"/sandwichs"
       },
       self: {
          href: "/categorie/"+req.params.id
       }
    }
 };
};*/

module.exports = mongoose.model("Category", schema);