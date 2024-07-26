const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  collegeUnit: { type: String },
  status: { type: String, enum: ['Cleared', 'Withheld', 'Pending'], default: 'Pending' },
  remarks: { type: String, default: 'No Remarks'},
});

const Status = mongoose.model('Status', statusSchema);
module.exports = Status;