const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminLoginSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Adminlogin = mongoose.model('admin-auth', AdminLoginSchema);
module.exports = Adminlogin;