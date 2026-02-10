const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },          // '2025-12-01'
  startTime: { type: String, required: true },     // '16:00'
  endTime: { type: String, required: true },       // '19:00'
  booked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.Mixed, default: null }, // userId or 'Admin'
  unavailable: {
    type: Boolean,
    default: false, // sirf admin-unavailable me true
  },
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);
