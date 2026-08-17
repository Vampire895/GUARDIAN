const mongoose = require("mongoose");

async function connectDB() {
    try {
        console.log("🔄 Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });

        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:");
        console.error(error);

        process.exit(1);
    }
}

module.exports = { connectDB };