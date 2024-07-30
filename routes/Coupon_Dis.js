const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Coupon = require("../models/Coupon");

router.post('/addcoupon', [
    body("percentoff", "Enter a valid percent.").isLength({ min: 1, max: 2 }),
    body("couponcode", "The Coupon Code must consist of exactly seven characters.").isLength({ min: 7, max: 7 }),
    body("startingdate", "Enter a valid starting date.").toDate(),
    body("expirydate", "Enter a valid expiry date.").toDate(),
], async (req, res) => {
    // console.log(res.data.percentoff);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let couponCompo = await Coupon.create({
            percentoff: req.body.percentoff,
            couponcode: req.body.couponcode,
            startingdate: req.body.startingdate,
            expirydate: req.body.expirydate,
        });

        return res.status(200).json({ success: true, data: couponCompo });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
});


router.get('/fetchcoupon', async (req, res) => {
    try {
        // Fetching coupons
        const coupons = await Coupon.find({});
        if (coupons.length === 0) {
            return res.status(404).json({ error: "No coupons found" }); 
        }
        return res.status(200).json(coupons); // Response 5
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" }); // Response 6
    }
});
router.post('/verifycoupon', async (req, res) => {
    try {
        const { coupon } = req.body;
        console.log("Received coupon:", coupon);

        if (!coupon) {
            return res.status(400).json({ error: "no coupon provided" });
        }

        const foundCoupon = await Coupon.findOne({ couponcode: coupon });
        if (!foundCoupon) {
            return res.status(400).json({ error: "no coupons found" });
        }

        return res.json(foundCoupon); // Returning found coupon details if successful
    } catch (error) {
        console.log("Server error:", error.message);
        return res.status(500).json({ error: "server error", message: error.message });
    }
});
router.post('/deletecoupon', async (req, res) => {
    try {
        const { id } = req.body;
        const coupon = await Coupon.findByIdAndDelete(id);
        console.log(coupon)
        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;