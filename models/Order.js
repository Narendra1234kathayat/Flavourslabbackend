const mongoose = require("mongoose");

const { Schema } = mongoose;

const OrderSchema = new Schema({
    orderproducts: [{
        productname: {
            type: String,
            required: true
        },
        productprice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalprice: {
        type: Number,
        required: true

    },
    tableNumber: {
        type: String,
        required: true
    },
    userOrdered: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;