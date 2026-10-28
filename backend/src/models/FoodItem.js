const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    vendor: { type: String, required: true },
    category: {
      type: String,
      enum: ['restaurants', 'bukas', 'groceries'],
      default: 'bukas'
    },
    description: { type: String },
    image: { type: String },
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodItem', foodItemSchema);