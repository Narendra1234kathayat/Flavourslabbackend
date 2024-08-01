const express = require("express");
require('dotenv').config()
const port = 4000;
const cors = require("cors");
const connectDb = require("./db");
const cookieParser = require("cookie-parser");
const app = express();

connectDb();


app.use(cookieParser());
app.use(express.json()); // Using middleware(If i have to use req.body then i have to write this middleware)
app.use("/Multer", express.static("Multer"));


// app.use(
//     cors({
//         origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow requests from these origins
//         credentials: true, // Allow cookies to be sent with the requests
//     })
// );

app.use(cors())

app.use('/api/auth', require('./routes/auth'));
app.use('/api/form', require('./routes/form'));
app.use('/api/admin_auth', require('./routes/admin_auth'));
app.use('/api/gallery', require('./routes/AddGallary'));
app.use('/api/category',require('./routes/AddCategory'));
app.use('/api/product',require('./routes/AddProducts'));
app.use('/api/orders',require('./routes/Orders'));
app.use('/api/coupon', require('./routes/Coupon_Dis'));

app.listen(port, () => {
    console.log(`FlavourFusion listening at port number: http://localhost:${port}`);
});