const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    enum: ["Graduating", "Transferring"],
    required: true,
  },
  semester: { type: String },
  acadYear: { type: String },
  shiftTo: { type: String },
  isUPCampus: { type: Boolean, default: false },
  file: { type: String },
  status: [{ type: mongoose.Schema.Types.ObjectId, ref: "Status" }],
  isSigned: { type: Boolean, default: false },
  isReviewed: { type: Number, default: -1, enum: [-1, 0, 1] },
  dateCreated: { type: Date, default: Date.now },
});

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
