const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema({
    productname: {
        type: String,
        required: true
    },
    productdesc: {
        type: String,
        required: true
    },
    productprice: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    productcategory: {
        type: String,
        required: true
    }, 
    quantity: {
        type: Number, 
        default:0
    }
});

const Product = mongoose.model('products', ProductSchema);
module.exports = Product;