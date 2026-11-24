const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tokenNo: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 },
      menuItemId: { type: require('mongoose').Schema.Types.ObjectId },
      comboId: { type: String }
    }
  ],
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Almost Ready', 'Ready', 'Completed'],
    default: 'Pending'
  },
  totalAmount: { type: Number, required: true },
  notes: { type: String, maxlength: 200 },
  studentId: { type: require('mongoose').Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vendorId: { type: require('mongoose').Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerPhone: String,
  paymentMethod: { type: String, enum: ['online', 'pickup_cash'], default: 'pickup_cash' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentReference: { type: String, unique: true, sparse: true },
  referralCode: { type: String, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
