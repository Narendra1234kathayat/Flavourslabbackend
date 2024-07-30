const mongoose = require("mongoose");
const mongoURI = "mongodb://127.0.0.1:27017/flavourfusion";

const connectDb = async () => {
    try {
        await mongoose.connect(mongoURI);
        await console.log("Connected to mongoDB Database successfully!");
    } catch (error) {
        console.error("Database not connected!");
    }
}

module.exports = connectDb;