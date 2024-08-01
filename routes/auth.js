const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const fetchuser = require("../middlewares/fetchuser");
const nodemailer = require("nodemailer");
// JWT contains - Header, payload(Data), & Signature
const jwt = require("jsonwebtoken");
const JWT_SECRET = "welcometoflavourfusion";


// verfify user

const verifyUser = async (req, res, next) => {
    try {
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");;
            console.log(token,"dfasf")
        if (!token) {
            return res.status(500).json({
                status: false,
                message: "No token"
            });
        }

        const decode = await jwt.verify(token, JWT_SECRET);
    console.log("decode",decode)
        req.user=decode._id

        next();
    } catch (error) {
        // Specific error response when token verification fails

        return res.status(401).json({
            status: false,
            message: "Unauthorized: Invalid token"
        });
    }
};


// Route 1: Create a new user using 'POST' method and its endpoint -> api/auth/signup

router.post(
    "/signup",
    [
        body("name", "Enter a valid username").isLength({ min: 2 }),
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password must be atleast 5 characters").isLength({
            min: 5,
        }),
        body("number", "Enter a valid number").isLength({ min: 10, max: 10 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            // Check whether the email exists already
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ error: "Email already in use" });
            }
            // Password Hashing - it converts password into ciphertext(encrytion) using hash algorithm.
            const salt = await bcrypt.genSalt(10);
            const securedPass = await bcrypt.hash(req.body.password, salt);
            // Create a new user
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                // password: req.body.password, -> By using this password store in plain text in DB.
                password: securedPass,
                number: req.body.number,
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
                message: "Record registered",
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Some Error occured");
        }
    }
);

// Endpoint to check if email already exists
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {

        return res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to check if number already exists
router.post('/check-number', async (req, res) => {
    try {
        const { number } = req.body;
        const existingNumber = await User.findOne({ number });
        if (existingNumber) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {

        return res.status(500).json({ error: "Internal server error" });
    }
});

// Route 2: Authenticate a user using 'POST' method and its endpoint -> api/auth/login

router.post(
    "/login",
    [
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password cannot be blank").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
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

            const authToken = jwt.sign({ username: user.id }, JWT_SECRET);

            // Set the cookie with the authToken
            if(!authToken){
                return res.status(400).json({error:"no auth token"});
            }
             
            
            return res.status(200).cookie("accesstoken", authToken).json({
                email: user.email,
                message: "Valid user",
                status: true,
                authToken
                
            });
        } catch (error) {
            console.error(error.message,"fdsaf");
            res.status(500).send("Internal Server Error!");
        }
    }
);

// Route 3: Get loggedin User details using 'POST' method and its endpoint -> api/auth/getuser

router.post("/getuser", fetchuser, async (req, res) => {
    // First middleware - fetchUser will run & then this func will run

    try {
        let userId = req.user; // Use req.user instead of req.username
        const user = await User.findById(userId).select("-password"); // select all fields except password.

        if (!user) {
            return res.status(404).send("User not found");
        }

       return res.status(200).json({user});
    } catch (error) {
        console.error(error.message);
       return  res.status(500).send("Internal Server Error!");
    }
});


router.get('/verify', verifyUser, (req, res) => {
    // Token verification successful
    
    return res.json({ status: true });
});

// Route 4: Logout user and its endpoint -> api/auth/logout

router.get('/logout', verifyUser, async (req, res) => {
    res.clearCookie('token');
    return res.json({ status: true });
})

// Route 5: Forgot Password and its endpoint -> api/auth/forgot (mail Sent to user verify email account for reset password)

router.post('/forgot', async (req, res) => {
    const { email } = req.body;
    try {

        if (!email) {
            res.json({ error: "no email found" })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ error: "email not registered" });
        }
        // const password = user.password;

        const token = jwt.sign({ user: user._id }, JWT_SECRET);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });

        var mailOptions = {
            from: 'theflavorslab980@gmail.com',
            to: email,
            subject: 'Reset password',
            text: `http://localhost:5173/reset-password/${token}`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.json({ message: "error sending email" })
            } else {
                return res.json({ status: true, message: "error sending mail" });
            }
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }

});

// Route 6: Reset Password and its endpoint -> api/auth/reset-password/:token -> (Reset Password is going to DB in encrypted way)

router.post('/reset-password/:token', async (req, res) => {
    const token = req.params.token;
    const { password } = req.body;
    console.log(token);
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        console.log(decoded);
        let id = decoded.user;
        console.log(id);
        const hashPassword = await bcrypt.hash(password, 10)
        await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
        return res.json({
            status: true, message: "updated password"
        })
    }
    catch (err) {
        return res.json("invalid token")
    }
});
router.post("/getusers", async (req, res) => {
    try {
      const users = await User.find({});
      if (users.length === 0) {
         res.json({ error: "No users found" });
      }
    res.json(users);
    } catch (error) {
       res.status(500).json({ error: error.message });
    }
  });

module.exports = router;