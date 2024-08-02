const JWT_SECRET = "welcometoflavourfusion";
const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
    try {
        const token = req.header("authToken");

        if (!token) {
            return res.status(401).json({ "message": "Unauthorized User" }); // Changed status code to 401 for Unauthorized
        }

        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
       // console.log(data);
        
        next();

    } catch (error) {
        return res.status(401).json({"message":"Authenticate With A Valid Token"}); // Changed status code to 401 for Unauthorized
    }
};

module.exports = verifyUser;
