const mongoose = require("mongoose");
const { Schema } = mongoose;

const CouponSchema = new Schema({
    percentoff: {
        type: Number,
        required: true
    },
    couponcode: {
        type: String,
        required: true
    },
    startingdate: {
        type: Date,
        required: true,
    },
    expirydate: {
        type: Date,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const coupon = mongoose.model('coupon', CouponSchema);
module.exports = coupon;