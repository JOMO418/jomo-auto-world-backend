// backend/seeds/categories.js
const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  { name: 'Suspension', slug: 'suspension', description: 'Suspension parts' },
  { name: 'Engine Parts', slug: 'engine', description: 'Engine components' },
  { name: 'Brakes', slug: 'brakes', description: 'Brake systems' },
  { name: 'Electrical', slug: 'electrical', description: 'Electrical parts' },
  { name: 'Body Parts', slug: 'body', description: 'Body panels' }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ Connected to MongoDB');
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log('✅ Categories seeded!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});