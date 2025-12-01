// scripts/seed.js - COMPLETE VERSION WITH 2 SAMPLE PRODUCTS
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

// Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Helper function to create slug
const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Sample Categories
const categories = [
  {
    name: 'Suspension & Steering',
    slug: 'suspension-steering',
    description: 'Shock absorbers, struts, springs, ball joints, tie rods, and control arms',
    icon: 'wrench'
  },
  {
    name: 'Engine Parts',
    slug: 'engine-parts',
    description: 'Filters, spark plugs, belts, hoses, engine mounts, and gaskets',
    icon: 'gauge'
  },
  {
    name: 'Braking System',
    slug: 'braking-system',
    description: 'Brake pads, rotors, drums, calipers, brake fluid, and master cylinders',
    icon: 'circle-dot'
  },
  {
    name: 'Electrical & Ignition',
    slug: 'electrical-ignition',
    description: 'Batteries, alternators, starters, ignition coils, and sensors',
    icon: 'zap'
  },
  {
    name: 'Cooling System',
    slug: 'cooling-system',
    description: 'Radiators, water pumps, thermostats, hoses, and cooling fans',
    icon: 'droplet'
  },
  {
    name: 'Transmission & Clutch',
    slug: 'transmission-clutch',
    description: 'Clutch kits, transmission mounts, CV joints, and drive shafts',
    icon: 'settings'
  },
  {
    name: 'Body & Exterior',
    slug: 'body-exterior',
    description: 'Bumpers, lights, mirrors, wipers, and body panels',
    icon: 'paint-bucket'
  },
  {
    name: 'Interior & Accessories',
    slug: 'interior-accessories',
    description: 'Floor mats, seat covers, steering wheels, and interior trim',
    icon: 'box'
  }
];

// Just 2 EXAMPLE products - Admin should DELETE these and add real products!
const sampleProducts = [
  {
    name: 'Example Product - Oil Filter',
    slug: createSlug('Example Product - Oil Filter'),
    description: 'This is an EXAMPLE product. Admin should delete this and add real products with actual photos of their inventory.',
    shortDescription: 'Example product - please replace with actual inventory',
    price: 1000,
    originalPrice: 1500,
    brand: 'OEM',
    partNumber: 'EXAMPLE-001',
    compatibility: [
      { make: 'Toyota', model: 'Example Model', year: '2020-2024' }
    ],
    images: [
      {
        url: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Add+Real+Product+Photo',
        alt: 'Placeholder - Add real photo'
      }
    ],
    stock: 0,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '0.5kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 0,
    numReviews: 0,
    soldCount: 0,
    tags: ['example', 'delete-me', 'engine']
  },
  {
    name: 'Example Product - Brake Pads',
    slug: createSlug('Example Product - Brake Pads'),
    description: 'This is an EXAMPLE product. Admin should delete this and add real products with actual photos of their inventory.',
    shortDescription: 'Example product - please replace with actual inventory',
    price: 5000,
    originalPrice: 7000,
    brand: 'Bosch',
    partNumber: 'EXAMPLE-002',
    compatibility: [
      { make: 'Toyota', model: 'Example Model', year: '2020-2024' }
    ],
    images: [
      {
        url: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Add+Real+Product+Photo',
        alt: 'Placeholder - Add real photo'
      }
    ],
    stock: 0,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '2kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 0,
    numReviews: 0,
    soldCount: 0,
    tags: ['example', 'delete-me', 'brakes']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // CREATE ADMIN USER
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Jomo Admin',
      email: 'jomo@autoworld.co.ke',
      password: 'wanjiku2025', // Plain password - model will hash it
      phone: '+254712345678',
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    console.log('✅ Admin user created');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: wanjiku2025\n`);

    // CREATE SAMPLE CUSTOMER
    console.log('👤 Creating sample customer...');
    const customer = await User.create({
      name: 'John Kamau',
      email: 'customer@example.com',
      password: 'Customer@123', // Plain password - model will hash it
      phone: '+254723456789',
      role: 'customer',
      isVerified: true,
      isActive: true,
      addresses: [{
        street: '123 Kenyatta Avenue',
        city: 'Nairobi',
        county: 'Nairobi',
        country: 'Kenya',
        isDefault: true
      }]
    });
    console.log('✅ Sample customer created');
    console.log(`   Email: customer@example.com`);
    console.log(`   Password: Customer@123\n`);

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // Create EXAMPLE products (admin should delete these)
    console.log('📦 Creating EXAMPLE products...');
    const productsWithCategories = sampleProducts.map((product, index) => {
      // Assign to appropriate category based on tags
      let categoryIndex = 0;
      if (product.tags.includes('engine')) {
        categoryIndex = 1; // Engine Parts
      } else if (product.tags.includes('brakes')) {
        categoryIndex = 2; // Braking System
      }

      return {
        ...product,
        category: createdCategories[categoryIndex]._id
      };
    });

    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${createdProducts.length} EXAMPLE products\n`);

    // Update category product counts
    console.log('📊 Updating category counts...');
    for (const category of createdCategories) {
      await category.updateProductCount();
    }
    console.log('✅ Category counts updated\n');

    console.log('='.repeat(60));
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n🔐 Login Credentials:\n');
    console.log('ADMIN ACCESS:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: wanjiku2025`);
    console.log('\nCUSTOMER ACCESS:');
    console.log(`  Email: customer@example.com`);
    console.log(`  Password: Customer@123`);
    console.log('\n📊 Database Statistics:');
    console.log(`  Categories: ${createdCategories.length}`);
    console.log(`  Products: ${createdProducts.length} (EXAMPLES ONLY - DELETE THESE!)`);
    console.log(`  Users: 2`);
    console.log('\n⚠️  IMPORTANT - Next Steps for Admin:');
    console.log('  1. Login as admin: jomo@autoworld.co.ke');
    console.log('  2. Go to Products section');
    console.log('  3. DELETE the 2 example products');
    console.log('  4. Click "Add Product" to add REAL spare parts');
    console.log('  5. Upload quality product images');
    console.log('  6. Fill in accurate prices and stock levels');
    console.log('\n💡 The example products are placeholders showing the structure.');
    console.log('   Replace them with your actual inventory!\n');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ SEEDING ERROR:');
    console.error('='.repeat(60));
    console.error(error);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

seedDatabase();