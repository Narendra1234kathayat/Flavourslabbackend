// Middleware to fetch user details from the token
const jwt = require("jsonwebtoken");
const JWT_SECRET = "welcometoflavourfusion";

const fetchUser = async (req, res, next) => {
    try {
        // Extract the token from cookies
        const token = req.cookies['token'];// Use req.cookies['token'] instead of req.cookies['auth-token']
        console.log(token);

        // If no token is present, send a 401 Unauthorized response
        if (!token) {
            return res.status(401).send({ error: "Please authenticate with a valid token" });
        }

        // Verify the token using the secret key
        const decodedData = await jwt.verify(token, JWT_SECRET);

        // If token verification fails, send a 401 Unauthorized response
        if (!decodedData) {
            return res.status(401).send({ error: "Authenticate using a valid token" });
        }

        // Attach the username to the request for later use in the route handler
        req.user = decodedData.username;

        // Log username for debugging (optional)
        console.log(req.user);

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(401).send({ error: "Authenticate using a valid token" });
    }
}

module.exports = fetchUser;