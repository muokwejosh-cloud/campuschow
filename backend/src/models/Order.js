const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tokenNo: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 }
    }
  ],
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Completed'],
    default: 'Pending'
  },
  totalAmount: { type: Number, required: true },
  notes: { type: String, maxlength: 200 }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);