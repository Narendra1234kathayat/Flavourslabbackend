const express = require("express");
const router = express.Router();
const Adminauth = require("../models/Admin_Auth");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "welcometoflavourfusion";
const fetchuser = require("../middlewares/fetchuser");

// Verify User

const verifyUser = async (req, res, next) => {
    try {
        const token = await req.cookies.admintoken;
        console.log(token);

        if (!token) {
            return res.json({
                status: false,
                message: "No token"
            });
        }

        const decode = await jwt.verify(token, JWT_SECRET);

        next();
    } catch (error) {
        // Specific error response when token verification fails

        return res.status(401).json({
            status: false,
            message: "Unauthorized: Invalid token"
        });
    }
};

router.get('/verify', verifyUser, (req, res) => {
    // Token verification successful
    return res.json({ status: true });
});

// Route 1: Create a admin using POST, and its endpoint is -> '/api/admin_auth/admin-signup'  

router.post('/admin-signup', [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({ min: 5, }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        // Check whether the email exists already
        let user = await Adminauth.findOne({ email: email });
        if (user) {
            return res.status(400).json({ error: "Email already in use" });
        }
        // Password Hashing - it converts password into ciphertext(encrytion) using hash algorithm.
        const salt = await bcrypt.genSalt(10);
        const securedPass = await bcrypt.hash(password, salt);
        // Create a new user
        user = await Adminauth.create({
            email: req.body.email,
            password: securedPass,
        });

        const data = {
            user: {
                id: user.id,
            },
        };
        const authToken = jwt.sign(data, JWT_SECRET);

        // res.json(user);  --> When user login then in return they get his credentials details
        // res.json({ authToken }); // --> Using this, user will get an token so that it can be verified
        return res.status(201).json({
            status: true,
            message: "New Admin registered!",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occured");
    }
}
);

// Route 2: Authenticate a admin using 'POST' method and its endpoint -> api/auth/admin-login

router.post('/admin-login', [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await Adminauth.findOne({ email });
        if (!user) {
            return res.json({ error: "Invalid credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.json({ error: "Invalid credentials" });
        }

        const data = {
            user: {
                id: user.id,
            },
        };

        const authToken = jwt.sign({ admin: user.id }, JWT_SECRET);

        // Set the cookie with the authToken
        res.cookie("admintoken", authToken, {
            httpOnly: true,
            // Add other cookie options if needed
        });

        return res.json({
            email: user.email,
            message: "Valid user",
            status: true,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error!");
    }
}
);

// Route 3: Get loggedin User details using 'POST' method and its endpoint -> api/auth/getuser

router.post("/getuser", fetchuser, async (req, res) => {
    // First middleware - fetchUser will run & then this func will run

    try {
        let userId = req.user; // Use req.user instead of req.username
        const user = await Adminauth.findById(userId).select("-password"); // select all fields except password.

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error!");
    }
});


// Route 4: Logout user and its endpoint -> api/auth/logout

router.get('/logout', verifyUser, async (req, res) => {
    res.clearCookie('admintoken');
    return res.json({ status: true });
})

module.exports = router;