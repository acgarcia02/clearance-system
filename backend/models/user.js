const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: {
    type: String,
    enum: ["student", "admin", "coordinator"],
    required: true,
  },
  unit: { type: Number },
  studentDetails: {
    lastName: { type: String },
    firstName: { type: String },
    middleName: { type: String },
    studentNumber: { type: String },
    degreeProgram: { type: String },
    contact: { type: String },
    address: { type: String },
    adviser: { type: String },
    uploadedID: { type: String },
  },
  allowNotifs: { type: Boolean, default: true },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
