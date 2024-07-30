const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReservationFormSchema = new Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
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
    userDate: {
        type: String, 
        required: true
    },
    time: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    reservation: {
        type: String,
        default: "pending"
    },
});

const ResForm = mongoose.model('reservationform', ReservationFormSchema);
module.exports = ResForm;

// module.exports = mongoose.model('reservationform', ReservationFormSchema);