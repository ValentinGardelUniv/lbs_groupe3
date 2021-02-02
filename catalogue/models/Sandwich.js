const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    ref: { type: String, index: true, required: true },
    nom: { type: String, text: true },
    description: { type: String, text: true },
    type_pain: { type: String, text: true },
    image: { type: Object, text: true },
    categories: { type: [String], text: true },
    prix: { type: /*mongoose.Schema.Types.Decimal128*/ Number, text: true }
});
let ex= mongoose.model("Sandwich", schema, "sandwichs");
ex.toJson= (sandwich)=>{
    return {
        type: "resource",
        sandwich: sandwich,
        links:{
            self: {
                href:"/sandwichs/"+sandwich.ref
            },
            categories: {
                href: "/sandwichs/"+sandwich.ref+"/categories"
            }
        }
    };
};

module.exports = ex;
