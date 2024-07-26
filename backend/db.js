const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDB() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectToDB;
