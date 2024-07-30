const mongoose = require("mongoose");
const { Schema } = mongoose;

const ContactFormSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }, 
    date: {
        type: Date,
        default: Date.now
    },
});

const ContactForm = mongoose.model('contactform', ContactFormSchema);
module.exports = ContactForm;