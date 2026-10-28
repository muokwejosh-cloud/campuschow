const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  location: { type: String, required: true },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);