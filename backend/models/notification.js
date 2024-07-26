const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  read: { type: Boolean, default: false},
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;