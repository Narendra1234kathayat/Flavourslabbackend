const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String, 
        required: true
    }, 
    type:{
        type: String,
        required: true
    }
});

const Category = mongoose.model('category', CategorySchema);
module.exports = Category;