const mongoose = require("mongoose");
const { Schema } = mongoose;

const GallerySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String, 
        required: true
    }, 
    
});

const Gallery = mongoose.model('gallery', GallerySchema);
module.exports = Gallery;