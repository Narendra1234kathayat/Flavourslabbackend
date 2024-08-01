const mongoose = require("mongoose");


const connectDb = async () => {
    try {
        const connectionurl = process.env.MONGO_URL;
        await mongoose.connect(connectionurl);
        await console.log("Connected to mongoDB Database successfully!");
    } catch (error) {
        console.error("Database not connected!");
    }
}

module.exports = connectDb;