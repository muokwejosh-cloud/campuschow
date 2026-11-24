const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'vendor', 'agent'], default: 'student' },
  storeName: { type: String },
  kitchenName: { type: String, trim: true },
  campusLocation: { type: String, trim: true },
  referralCode: { type: String, unique: true, sparse: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
