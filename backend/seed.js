require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('./src/models/FoodItem');

const sampleDishes = [
  {
    name: 'Special Agege Bread & Fried Egg Combo',
    price: 1500,
    vendor: 'Campus Kiosk A',
    category: 'bukas',
    description: 'Fresh warm Agege bread served with fried egg, hot sauce, and plantain slices.',
    image: '/agege-bread.jpg',
    inStock: true
  },
  {
    name: 'Smoky Jollof Rice & Crispy Chicken',
    price: 2500,
    vendor: 'Sub Cafeteria',
    category: 'restaurants',
    description: 'Firewood jollof rice paired with seasoned fried chicken and fried dodo.',
    image: '/jollof-chicken.jpg',
    inStock: true
  },
  {
    name: 'Ewa Aganyin & Soft Dodo Combo',
    price: 1800,
    vendor: 'Iya Basira Kiosk',
    category: 'bukas',
    description: 'Slow-cooked mashed beans drenched in spicy caramelized onion sauce with plantain.',
    image: '/ewa-aganyin.jpg',
    inStock: true
  },
  {
    name: 'Fried Rice, Beef & Chilled Drink',
    price: 2200,
    vendor: 'Quadrangle Bites',
    category: 'restaurants',
    description: 'Liver-infused fried rice served with tender fried beef and cold pet soda.',
    image: '/fried-rice.jpg',
    inStock: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas for seeding');

    await FoodItem.deleteMany({});
    console.log('🗑️  Cleared existing food items');

    await FoodItem.insertMany(sampleDishes);
    console.log('🍽️  Successfully seeded campus food items into MongoDB Atlas');

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();