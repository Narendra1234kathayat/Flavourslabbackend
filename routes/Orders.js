const express = require('express');
const router = express.Router();
const Order = require('../models/Order')
const User = require('../models/User')
const jwt = require("jsonwebtoken");
const JWT_SECRET = "welcometoflavourfusion";
const verifyUser = require("../middlewares/VerifyUser");


// const verifyUser = async (req, res, next) => {
//     try {
//         const token = await req.cookies.token;
//         console.log(token, "token");

//         if (!token) {
//             return res.json({
//                 status: false,
//                 message: "No token",
//             });
//         }

//         const decode = await jwt.verify(token, JWT_SECRET);
//         console.log(decode, "ddd")
//         req.data = decode.username;
//         console.log("req data", req.data)


//         next();
//     } catch (error) {
//         // Specific error response when token verification fails

//         return res.status(401).json({
//             status: false,
//             message: "Unauthorized: Invalid token",
//         });
//     }
// };

router.use('/order', verifyUser, async (req, res) => {
    const { orderproducts, totalprice, tableNumber } = req.body;
    console.log(orderproducts, '', totalprice)

    try {
        // Create a new order document
        const users = await User.findOne({ _id: req.user.id });
        console.log(users._id, "user_id")
        const newOrder = await Order.create({
            orderproducts: orderproducts,
            userOrdered: users._id,
            totalprice: totalprice,
            tableNumber: tableNumber
        });

        // Save the order to the database
        const order = await newOrder.save();

        // Respond with the created order
        res.json({ order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.get('/fetchorder', verifyUser, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id});
        if (!user) {
            return res.status(400).json({ error: "No user found" });
        }

        const order = await Order.find({ userOrdered: user._id })
            .sort({ date: -1 }) // Sort by date, descending
        //  .limit(1); // Limit to 1 to get the most recent order

        if (order) {
            return res.json(order);
        } else {
            return res.status(400).json({ error: "No order found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
});

router.get('/fetchallorders', async (req, res) => {
    try {
        const orders = await Order.find({})
            .sort({ date: -1 }); // Sort orders by date, descending

        if (orders.length === 0) {
            return res.status(404).json({ error: "No orders found" });
        }

        const ordersWithUser = [];

        for (const order of orders) {
            const user = await User.findById(order.userOrdered);
            if (!user) {
                // If user not found, handle the error
                return res.status(404).json({ error: "User not found for order" });
            }
            const orderWithUser = {
                ...order.toObject(),
                userName: user.name
            };
            ordersWithUser.push(orderWithUser);
        }
        return res.status(200).json(ordersWithUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});




module.exports = router;