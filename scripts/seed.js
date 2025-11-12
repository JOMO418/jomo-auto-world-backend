// scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Comprehensive Sample Products for Toyota
const sampleProducts = [
  // SUSPENSION & STEERING
  {
    name: 'KYB Excel-G Shock Absorber Set (4pcs) - Front & Rear',
    slug: createSlug('KYB Excel-G Shock Absorber Set (4pcs) - Front & Rear'),
    description: 'Premium KYB Excel-G shock absorbers providing superior ride comfort and handling. Direct OEM replacement for Toyota vehicles. These shock absorbers feature twin-tube design with multi-stage valving for optimal damping control. Restores original ride quality and handling. Perfect for daily driving and light touring. Set includes 2 front and 2 rear shock absorbers.',
    shortDescription: 'Premium OEM-quality shock absorbers with superior damping and comfort',
    price: 18500,
    originalPrice: 28500,
    brand: 'KYB',
    partNumber: 'KYB-EXC-001',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Wish', year: '2003-2017' },
      { make: 'Toyota', model: 'Corolla', year: '2008-2019' },
      { make: 'Toyota', model: 'Axio', year: '2006-2020' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800',
        alt: 'KYB Excel-G Shock Absorber Set'
      }
    ],
    stock: 15,
    featured: true,
    bestSeller: true,
    specifications: {
      weight: '8kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Steel & Hydraulic Oil'
    },
    warranty: '1 Year',
    rating: 4.8,
    numReviews: 156,
    soldCount: 234,
    tags: ['suspension', 'shock absorber', 'kyb', 'toyota', 'front', 'rear']
  },
  {
    name: 'Monroe Coil Springs Set - Front (Pair)',
    slug: createSlug('Monroe Coil Springs Set - Front (Pair)'),
    description: 'High-quality Monroe coil springs designed for optimal load-bearing capacity and ride height maintenance. Manufactured to OE specifications with enhanced durability. Heat-treated alloy steel construction ensures long service life. Maintains proper vehicle stance and handling characteristics.',
    shortDescription: 'OEM-quality coil springs for proper ride height and load support',
    price: 8900,
    originalPrice: 13500,
    brand: 'Monroe',
    partNumber: 'MON-SPR-002',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Succeed', year: '2002-2020' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800',
        alt: 'Monroe Coil Springs'
      }
    ],
    stock: 12,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '6kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Alloy Steel'
    },
    warranty: '1 Year',
    rating: 4.7,
    numReviews: 89,
    soldCount: 178,
    tags: ['suspension', 'coil springs', 'monroe', 'toyota', 'front']
  },
  {
    name: 'Ball Joint Set - Lower & Upper (4 Pieces)',
    slug: createSlug('Ball Joint Set - Lower & Upper (4 Pieces)'),
    description: 'Complete ball joint set for Toyota vehicles. Includes 2 lower and 2 upper ball joints. Precision-engineered for perfect fit and reliable performance. Features sealed design to prevent contamination and extend service life. Essential for maintaining proper steering geometry and safety.',
    shortDescription: 'Complete ball joint set for steering precision and safety',
    price: 7200,
    originalPrice: 11000,
    brand: 'Genuine',
    partNumber: 'GEN-BAL-003',
    compatibility: [
      { make: 'Toyota', model: 'Wish', year: '2003-2017' },
      { make: 'Toyota', model: 'Ist', year: '2002-2016' },
      { make: 'Toyota', model: 'Ractis', year: '2005-2016' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800',
        alt: 'Ball Joint Set'
      }
    ],
    stock: 20,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '2.5kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.6,
    numReviews: 67,
    soldCount: 134,
    tags: ['suspension', 'ball joint', 'steering', 'toyota']
  },
  {
    name: 'Tie Rod End Set (Inner & Outer) - Complete',
    slug: createSlug('Tie Rod End Set (Inner & Outer) - Complete'),
    description: 'Complete tie rod end set including both inner and outer tie rod ends. Ensures precise steering response and proper wheel alignment. Heat-treated steel construction with protective rubber boots. Critical safety component for steering system integrity.',
    shortDescription: 'Complete tie rod set for accurate steering and alignment',
    price: 5800,
    originalPrice: 8500,
    brand: 'OEM',
    partNumber: 'OEM-TIE-004',
    compatibility: [
      { make: 'Toyota', model: 'Corolla', year: '2008-2019' },
      { make: 'Toyota', model: 'Axio', year: '2006-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2006-2020' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800',
        alt: 'Tie Rod End Set'
      }
    ],
    stock: 18,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '1.8kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.5,
    numReviews: 54,
    soldCount: 98,
    tags: ['steering', 'tie rod', 'alignment', 'toyota']
  },

  // BRAKING SYSTEM
  {
    name: 'Bosch Brake Pad Set - Front & Rear (Complete)',
    slug: createSlug('Bosch Brake Pad Set - Front & Rear (Complete)'),
    description: 'High-performance Bosch brake pads with low dust formula and quiet operation. Features ceramic composite material for extended wear and reduced brake dust. Excellent stopping power in all weather conditions. Specially designed for Asian vehicles with optimized friction characteristics. Includes front and rear brake pads.',
    shortDescription: 'Premium ceramic brake pads with low dust and exceptional stopping power',
    price: 7800,
    originalPrice: 12000,
    brand: 'Bosch',
    partNumber: 'BSH-BRK-001',
    compatibility: [
      { make: 'Toyota', model: 'Wish', year: '2003-2017' },
      { make: 'Toyota', model: 'Belta', year: '2005-2012' },
      { make: 'Toyota', model: 'Sienta', year: '2003-2015' },
      { make: 'Toyota', model: 'Vitz', year: '2005-2019' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800',
        alt: 'Bosch Brake Pads'
      }
    ],
    stock: 25,
    featured: true,
    bestSeller: true,
    specifications: {
      weight: '3kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Ceramic Composite'
    },
    warranty: '1 Year',
    rating: 4.9,
    numReviews: 203,
    soldCount: 445,
    tags: ['brakes', 'brake pads', 'bosch', 'toyota', 'ceramic']
  },
  {
    name: 'Brembo Brake Rotor/Disc Set - Front (Pair)',
    slug: createSlug('Brembo Brake Rotor/Disc Set - Front (Pair)'),
    description: 'Premium Brembo brake rotors with superior heat dissipation and durability. Precision-machined surface ensures optimal pad contact and braking performance. Vented design for enhanced cooling. Reduces brake fade during aggressive driving or heavy loads.',
    shortDescription: 'Premium vented brake rotors for superior heat dissipation',
    price: 12500,
    originalPrice: 18000,
    brand: 'Brembo',
    partNumber: 'BRM-ROT-002',
    compatibility: [
      { make: 'Toyota', model: 'Mark X', year: '2004-2019' },
      { make: 'Toyota', model: 'Crown', year: '2003-2018' },
      { make: 'Toyota', model: 'Camry', year: '2006-2017' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800',
        alt: 'Brembo Brake Rotors'
      }
    ],
    stock: 10,
    featured: true,
    bestSeller: false,
    specifications: {
      weight: '12kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Cast Iron'
    },
    warranty: '2 Years',
    rating: 4.8,
    numReviews: 128,
    soldCount: 187,
    tags: ['brakes', 'brake rotor', 'disc', 'brembo', 'toyota']
  },
  {
    name: 'Brake Master Cylinder - OEM Quality',
    slug: createSlug('Brake Master Cylinder - OEM Quality'),
    description: 'High-quality brake master cylinder ensuring consistent brake pedal feel and reliable hydraulic pressure. Includes reservoir and mounting hardware. Precision-bore cylinder for smooth operation. Critical safety component with strict quality control.',
    shortDescription: 'OEM-quality master cylinder for reliable brake hydraulics',
    price: 6500,
    originalPrice: 9500,
    brand: 'Genuine',
    partNumber: 'GEN-MST-003',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Succeed', year: '2002-2020' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800',
        alt: 'Brake Master Cylinder'
      }
    ],
    stock: 8,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '1.5kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.7,
    numReviews: 45,
    soldCount: 76,
    tags: ['brakes', 'master cylinder', 'hydraulic', 'toyota']
  },

  // ENGINE PARTS
  {
    name: 'NGK Iridium Spark Plugs Set (4pcs)',
    slug: createSlug('NGK Iridium Spark Plugs Set (4pcs)'),
    description: 'Genuine NGK iridium spark plugs providing better fuel efficiency and smoother engine performance. Long-lasting iridium center electrode ensures 100,000km service life. Superior ignitability and anti-fouling properties. Improves cold starting and reduces emissions. Perfect for Toyota engines.',
    shortDescription: 'Premium iridium spark plugs for better performance and fuel economy',
    price: 3200,
    originalPrice: 4500,
    brand: 'NGK',
    partNumber: 'NGK-SPK-001',
    compatibility: [
      { make: 'Toyota', model: 'Belta', year: '2005-2012' },
      { make: 'Toyota', model: 'Wish', year: '2003-2017' },
      { make: 'Toyota', model: 'Vitz', year: '2005-2019' },
      { make: 'Toyota', model: 'Ractis', year: '2005-2016' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800',
        alt: 'NGK Spark Plugs'
      }
    ],
    stock: 50,
    featured: true,
    bestSeller: true,
    specifications: {
      weight: '0.3kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Iridium'
    },
    warranty: '2 Years',
    rating: 4.9,
    numReviews: 312,
    soldCount: 567,
    tags: ['engine', 'spark plugs', 'ngk', 'iridium', 'toyota']
  },
  {
    name: 'Mann Filter Oil Filter - Premium',
    slug: createSlug('Mann Filter Oil Filter - Premium'),
    description: 'High-quality Mann oil filter with superior filtration efficiency. Multi-layer filter media captures contaminants while maintaining optimal oil flow. Anti-drainback valve prevents dry starts. Essential for engine protection and longevity.',
    shortDescription: 'Premium oil filter with superior filtration and engine protection',
    price: 850,
    originalPrice: 1200,
    brand: 'Mann Filter',
    partNumber: 'MAN-OIL-002',
    compatibility: [
      { make: 'Toyota', model: 'Corolla', year: '2008-2019' },
      { make: 'Toyota', model: 'Axio', year: '2006-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2006-2020' },
      { make: 'Toyota', model: 'Wish', year: '2003-2017' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800',
        alt: 'Mann Oil Filter'
      }
    ],
    stock: 100,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '0.4kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '6 Months',
    rating: 4.8,
    numReviews: 456,
    soldCount: 892,
    tags: ['engine', 'oil filter', 'mann', 'toyota', 'filter']
  },
  {
    name: 'Mann Filter Air Filter - High Flow',
    slug: createSlug('Mann Filter Air Filter - High Flow'),
    description: 'Premium air filter providing maximum engine protection and improved airflow. Multi-fiber filter media captures 99.9% of harmful particles. Maintains optimal air-fuel mixture for better performance and fuel economy.',
    shortDescription: 'High-flow air filter for better engine breathing and protection',
    price: 1200,
    originalPrice: 1800,
    brand: 'Mann Filter',
    partNumber: 'MAN-AIR-003',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Succeed', year: '2002-2020' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800',
        alt: 'Mann Air Filter'
      }
    ],
    stock: 80,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '0.5kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '6 Months',
    rating: 4.7,
    numReviews: 234,
    soldCount: 478,
    tags: ['engine', 'air filter', 'mann', 'toyota', 'filter']
  },
  {
    name: 'Denso Engine Mount Kit (3 Pieces)',
    slug: createSlug('Denso Engine Mount Kit (3 Pieces)'),
    description: 'Complete engine mount kit by Denso. Reduces vibration and engine noise effectively. Made from high-quality rubber compound that withstands extreme temperatures and engine movement. Essential for smooth engine operation and passenger comfort. Includes front, rear, and side engine mounts.',
    shortDescription: 'Complete engine mount kit for vibration reduction and comfort',
    price: 5500,
    originalPrice: 8500,
    brand: 'Denso',
    partNumber: 'DNS-ENG-004',
    compatibility: [
      { make: 'Toyota', model: 'Belta', year: '2005-2012' },
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Vitz', year: '2005-2019' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800',
        alt: 'Denso Engine Mount Kit'
      }
    ],
    stock: 12,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '2.5kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Rubber & Steel'
    },
    warranty: '1 Year',
    rating: 4.7,
    numReviews: 89,
    soldCount: 178,
    tags: ['engine', 'engine mount', 'denso', 'toyota', 'vibration']
  },
  {
    name: 'Timing Belt Kit with Water Pump',
    slug: createSlug('Timing Belt Kit with Water Pump'),
    description: 'Complete timing belt kit including timing belt, tensioner, idler pulleys, and water pump. Ensures proper engine timing and prevents catastrophic engine failure. High-quality materials resist heat and wear. Critical maintenance item for interference engines.',
    shortDescription: 'Complete timing belt kit with water pump for engine protection',
    price: 9800,
    originalPrice: 15000,
    brand: 'Genuine',
    partNumber: 'GEN-TIM-005',
    compatibility: [
      { make: 'Toyota', model: 'Corolla', year: '2000-2008' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2008' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800',
        alt: 'Timing Belt Kit'
      }
    ],
    stock: 15,
    featured: true,
    bestSeller: false,
    specifications: {
      weight: '3.5kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.8,
    numReviews: 156,
    soldCount: 234,
    tags: ['engine', 'timing belt', 'water pump', 'toyota', 'kit']
  },
  {
    name: 'Fuel Filter - High Performance',
    slug: createSlug('Fuel Filter - High Performance'),
    description: 'High-performance fuel filter ensuring clean fuel delivery to the engine. Multi-stage filtration removes water and contaminants. Prevents fuel pump and injector damage. Essential for maintaining optimal engine performance.',
    shortDescription: 'Premium fuel filter for clean fuel delivery and engine protection',
    price: 1500,
    originalPrice: 2200,
    brand: 'Mann Filter',
    partNumber: 'MAN-FUE-006',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Succeed', year: '2002-2020' },
      { make: 'Toyota', model: 'Corolla', year: '2000-2019' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800',
        alt: 'Fuel Filter'
      }
    ],
    stock: 60,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '0.3kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '6 Months',
    rating: 4.6,
    numReviews: 178,
    soldCount: 345,
    tags: ['engine', 'fuel filter', 'mann', 'toyota']
  },

  // COOLING SYSTEM
  {
    name: 'Denso Radiator - Aluminum Core',
    slug: createSlug('Denso Radiator - Aluminum Core'),
    description: 'High-quality Denso radiator with aluminum core for superior heat dissipation. Lightweight yet durable construction. Precision-engineered to OEM specifications. Includes drain plug and mounting brackets. Essential for preventing engine overheating.',
    shortDescription: 'Premium aluminum radiator for efficient engine cooling',
    price: 14500,
    originalPrice: 22000,
    brand: 'Denso',
    partNumber: 'DNS-RAD-001',
    compatibility: [
      { make: 'Toyota', model: 'Wish', year: '2003-2017' },
      { make: 'Toyota', model: 'Isis', year: '2004-2017' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800',
        alt: 'Denso Radiator'
      }
    ],
    stock: 6,
    featured: true,
    bestSeller: false,
    specifications: {
      weight: '8kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Aluminum'
    },
    warranty: '2 Years',
    rating: 4.8,
    numReviews: 92,
    soldCount: 145,
    tags: ['cooling', 'radiator', 'denso', 'toyota', 'aluminum']
  },
  {
    name: 'Water Pump - OEM Quality',
    slug: createSlug('Water Pump - OEM Quality'),
    description: 'High-quality water pump ensuring efficient coolant circulation. Precision-machined impeller and housing for optimal flow. Sealed bearings for long service life. Includes gasket and mounting hardware.',
    shortDescription: 'OEM-quality water pump for reliable coolant circulation',
    price: 4800,
    originalPrice: 7200,
    brand: 'OEM',
    partNumber: 'OEM-WAT-002',
    compatibility: [
      { make: 'Toyota', model: 'Corolla', year: '2008-2019' },
      { make: 'Toyota', model: 'Axio', year: '2006-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2006-2020' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800',
        alt: 'Water Pump'
      }
    ],
    stock: 20,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '1.8kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.7,
    numReviews: 134,
    soldCount: 267,
    tags: ['cooling', 'water pump', 'toyota', 'coolant']
  },
  {
    name: 'Thermostat with Gasket',
    slug: createSlug('Thermostat with Gasket'),
    description: 'Precision thermostat maintaining optimal engine temperature. Opens and closes at exact temperature for efficient cooling. Includes new gasket for leak-free installation. Prevents overcooling and overheating.',
    shortDescription: 'Precision thermostat for optimal engine temperature control',
    price: 1800,
    originalPrice: 2800,
    brand: 'Denso',
    partNumber: 'DNS-THR-003',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Succeed', year: '2002-2020' },
      { make: 'Toyota', model: 'Belta', year: '2005-2012' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800',
        alt: 'Thermostat'
      }
    ],
    stock: 45,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '0.2kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.6,
    numReviews: 98,
    soldCount: 198,
    tags: ['cooling', 'thermostat', 'denso', 'toyota']
  },

  // ELECTRICAL & IGNITION
  {
    name: 'Bosch Battery - 55Ah Maintenance Free',
    slug: createSlug('Bosch Battery - 55Ah Maintenance Free'),
    description: 'Premium Bosch maintenance-free battery with 55Ah capacity. Advanced calcium technology for longer life and better performance. Spill-proof design with built-in hydrometer. Excellent cold-cranking performance. 2-year warranty.',
    shortDescription: 'Premium maintenance-free battery with excellent cold-start performance',
    price: 8500,
    originalPrice: 12000,
    brand: 'Bosch',
    partNumber: 'BSH-BAT-001',
    compatibility: [
      { make: 'Toyota', model: 'Corolla', year: '2000-2019' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Axio', year: '2006-2020' },
      { make: 'Toyota', model: 'Wish', year: '2003-2017' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800',
        alt: 'Bosch Battery'
      }
    ],
    stock: 15,
    featured: true,
    bestSeller: true,
    specifications: {
      weight: '15kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Lead Acid'
    },
    warranty: '2 Years',
    rating: 4.9,
    numReviews: 267,
    soldCount: 456,
    tags: ['electrical', 'battery', 'bosch', 'toyota', '55ah']
  },
  {
    name: 'Denso Alternator - 80A Output',
    slug: createSlug('Denso Alternator - 80A Output'),
    description: 'High-output Denso alternator providing reliable electrical power. 80A capacity handles modern electrical loads. New brushes and bearings for extended life. Includes pulley and mounting hardware. Critical for battery charging and electrical system operation.',
    shortDescription: 'High-output alternator for reliable electrical power generation',
    price: 12500,
    originalPrice: 18500,
    brand: 'Denso',
    partNumber: 'DNS-ALT-002',
    compatibility: [
      { make: 'Toyota', model: 'Wish', year: '2003-2017' },
      { make: 'Toyota', model: 'Corolla', year: '2008-2019' },
      { make: 'Toyota', model: 'Fielder', year: '2006-2020' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800',
        alt: 'Denso Alternator'
      }
    ],
    stock: 8,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '6kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.8,
    numReviews: 145,
    soldCount: 234,
    tags: ['electrical', 'alternator', 'denso', 'toyota', '80a']
  },
  {
    name: 'Denso Starter Motor - High Torque',
    slug: createSlug('Denso Starter Motor - High Torque'),
    description: 'Reliable Denso starter motor with high-torque design for easy engine starting. New solenoid and bearings. Tested to OEM specifications. Essential for reliable cold starts and daily operation.',
    shortDescription: 'High-torque starter motor for reliable engine starting',
    price: 9800,
    originalPrice: 14500,
    brand: 'Denso',
    partNumber: 'DNS-STR-003',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Succeed', year: '2002-2020' },
      { make: 'Toyota', model: 'Belta', year: '2005-2012' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800',
        alt: 'Denso Starter Motor'
      }
    ],
    stock: 10,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '4.5kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.7,
    numReviews: 112,
    soldCount: 189,
    tags: ['electrical', 'starter', 'denso', 'toyota']
  },
  {
    name: 'NGK Ignition Coil Set (4pcs)',
    slug: createSlug('NGK Ignition Coil Set (4pcs)'),
    description: 'Premium NGK ignition coils providing strong spark for complete combustion. Improves fuel efficiency and reduces emissions. Heat-resistant design for long service life. Essential for smooth engine operation and performance.',
    shortDescription: 'Premium ignition coils for strong spark and smooth running',
    price: 8900,
    originalPrice: 13500,
    brand: 'NGK',
    partNumber: 'NGK-IGN-004',
    compatibility: [
      { make: 'Toyota', model: 'Vitz', year: '2005-2019' },
      { make: 'Toyota', model: 'Belta', year: '2005-2012' },
      { make: 'Toyota', model: 'Ractis', year: '2005-2016' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800',
        alt: 'NGK Ignition Coils'
      }
    ],
    stock: 22,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '1.2kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.8,
    numReviews: 167,
    soldCount: 289,
    tags: ['electrical', 'ignition coil', 'ngk', 'toyota']
  },

  // TRANSMISSION & CLUTCH
  {
    name: 'Clutch Kit - Complete (3-Piece)',
    slug: createSlug('Clutch Kit - Complete (3-Piece)'),
    description: 'Complete clutch kit including clutch disc, pressure plate, and release bearing. High-quality friction material for smooth engagement. Designed for reliable performance and extended life. Essential for manual transmission vehicles.',
    shortDescription: 'Complete 3-piece clutch kit for smooth operation',
    price: 11500,
    originalPrice: 17000,
    brand: 'Genuine',
    partNumber: 'GEN-CLU-001',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Succeed', year: '2002-2020' },
      { make: 'Toyota', model: 'Corolla', year: '2000-2008' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800',
        alt: 'Clutch Kit'
      }
    ],
    stock: 12,
    featured: true,
    bestSeller: false,
    specifications: {
      weight: '7kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.7,
    numReviews: 98,
    soldCount: 167,
    tags: ['transmission', 'clutch', 'clutch kit', 'toyota']
  },
  {
    name: 'CV Joint Set - Front (Inner & Outer)',
    slug: createSlug('CV Joint Set - Front (Inner & Outer)'),
    description: 'Complete CV joint set for front axle including inner and outer joints. High-quality grease-packed design prevents contamination. Includes boots and clamps. Essential for smooth power transfer to wheels.',
    shortDescription: 'Complete CV joint set for smooth power transfer',
    price: 9200,
    originalPrice: 14000,
    brand: 'OEM',
    partNumber: 'OEM-CVJ-002',
    compatibility: [
      { make: 'Toyota', model: 'Wish', year: '2003-2017' },
      { make: 'Toyota', model: 'Isis', year: '2004-2017' },
      { make: 'Toyota', model: 'Corolla', year: '2008-2019' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800',
        alt: 'CV Joint Set'
      }
    ],
    stock: 15,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '5kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.6,
    numReviews: 134,
    soldCount: 245,
    tags: ['transmission', 'cv joint', 'axle', 'toyota']
  },
  {
    name: 'Transmission Mount - Heavy Duty',
    slug: createSlug('Transmission Mount - Heavy Duty'),
    description: 'Heavy-duty transmission mount reducing vibration and supporting transmission weight. High-quality rubber compound withstands heat and stress. Essential for smooth gear changes and reduced noise.',
    shortDescription: 'Heavy-duty transmission mount for vibration reduction',
    price: 2800,
    originalPrice: 4200,
    brand: 'OEM',
    partNumber: 'OEM-TRM-003',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Corolla', year: '2000-2019' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800',
        alt: 'Transmission Mount'
      }
    ],
    stock: 25,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '1.5kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.5,
    numReviews: 76,
    soldCount: 143,
    tags: ['transmission', 'mount', 'toyota']
  },

  // BODY & EXTERIOR
  {
    name: 'Headlight Assembly - Left (Driver Side)',
    slug: createSlug('Headlight Assembly - Left (Driver Side)'),
    description: 'OEM-quality headlight assembly with clear lens and reflective housing. Direct replacement for damaged or foggy headlights. Includes bulb holders and adjustment mechanism. Improves night visibility and vehicle appearance.',
    shortDescription: 'OEM-quality headlight assembly for better visibility',
    price: 6500,
    originalPrice: 9500,
    brand: 'OEM',
    partNumber: 'OEM-HDL-001',
    compatibility: [
      { make: 'Toyota', model: 'Fielder', year: '2006-2012' },
      { make: 'Toyota', model: 'Axio', year: '2006-2012' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
        alt: 'Headlight Assembly'
      }
    ],
    stock: 8,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '2kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.7,
    numReviews: 67,
    soldCount: 112,
    tags: ['body', 'headlight', 'lighting', 'toyota']
  },
  {
    name: 'Side Mirror - Power Folding (Left)',
    slug: createSlug('Side Mirror - Power Folding (Left)'),
    description: 'Power-folding side mirror with integrated turn signal. Electric adjustment and heating function. Direct OEM replacement with perfect fit. Improves safety and convenience.',
    shortDescription: 'Power-folding mirror with turn signal and heating',
    price: 4800,
    originalPrice: 7200,
    brand: 'OEM',
    partNumber: 'OEM-MIR-002',
    compatibility: [
      { make: 'Toyota', model: 'Wish', year: '2009-2017' },
      { make: 'Toyota', model: 'Isis', year: '2009-2017' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800',
        alt: 'Side Mirror'
      }
    ],
    stock: 10,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '1.2kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '1 Year',
    rating: 4.6,
    numReviews: 54,
    soldCount: 89,
    tags: ['body', 'mirror', 'side mirror', 'toyota']
  },
  {
    name: 'Windshield Wiper Blades Set (Pair)',
    slug: createSlug('Windshield Wiper Blades Set (Pair)'),
    description: 'Premium wiper blades with natural rubber for streak-free wiping. Aerodynamic design reduces wind lift. Easy installation with universal adapter. Essential for clear visibility in rain.',
    shortDescription: 'Premium wiper blades for streak-free visibility',
    price: 1800,
    originalPrice: 2800,
    brand: 'Bosch',
    partNumber: 'BSH-WIP-003',
    compatibility: [
      { make: 'Toyota', model: 'Corolla', year: '2008-2019' },
      { make: 'Toyota', model: 'Fielder', year: '2006-2020' },
      { make: 'Toyota', model: 'Axio', year: '2006-2020' },
      { make: 'Toyota', model: 'Wish', year: '2003-2017' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800',
        alt: 'Wiper Blades'
      }
    ],
    stock: 50,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '0.4kg',
      origin: 'Japan',
      condition: 'New'
    },
    warranty: '6 Months',
    rating: 4.8,
    numReviews: 234,
    soldCount: 456,
    tags: ['body', 'wiper', 'wiper blades', 'bosch', 'toyota']
  },

  // INTERIOR & ACCESSORIES
  {
    name: 'Floor Mats Set - All Weather (5pcs)',
    slug: createSlug('Floor Mats Set - All Weather (5pcs)'),
    description: 'Premium all-weather floor mats with deep grooves to trap dirt and water. Durable rubber construction resistant to wear. Custom-fit design with anti-slip backing. Protects carpet and enhances interior appearance.',
    shortDescription: 'Premium all-weather floor mats for interior protection',
    price: 3500,
    originalPrice: 5500,
    brand: 'Other',
    partNumber: 'ACC-FLR-001',
    compatibility: [
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Corolla', year: '2000-2019' },
      { make: 'Toyota', model: 'Axio', year: '2006-2020' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=800',
        alt: 'Floor Mats'
      }
    ],
    stock: 30,
    featured: false,
    bestSeller: true,
    specifications: {
      weight: '3kg',
      origin: 'Japan',
      condition: 'New',
      material: 'Rubber'
    },
    warranty: '1 Year',
    rating: 4.7,
    numReviews: 189,
    soldCount: 345,
    tags: ['interior', 'floor mats', 'accessories', 'toyota']
  },
  {
    name: 'Seat Covers - Full Set (Leather Look)',
    slug: createSlug('Seat Covers - Full Set (Leather Look)'),
    description: 'Premium leather-look seat covers for complete interior upgrade. Durable synthetic leather with comfortable padding. Custom-fit design for perfect installation. Protects original seats and adds luxury feel.',
    shortDescription: 'Premium leather-look seat covers for luxury feel',
    price: 8900,
    originalPrice: 14000,
    brand: 'Other',
    partNumber: 'ACC-SEA-002',
    compatibility: [
      { make: 'Toyota', model: 'Probox', year: '2002-2020' },
      { make: 'Toyota', model: 'Fielder', year: '2000-2020' },
      { make: 'Toyota', model: 'Wish', year: '2003-2017' }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800',
        alt: 'Seat Covers'
      }
    ],
    stock: 15,
    featured: false,
    bestSeller: false,
    specifications: {
      weight: '4kg',
      origin: 'Japan',
      condition: 'New',
      material: 'PU Leather'
    },
    warranty: '6 Months',
    rating: 4.5,
    numReviews: 123,
    soldCount: 198,
    tags: ['interior', 'seat covers', 'accessories', 'toyota']
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

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('wanjiku2025', 10);
    const admin = await User.create({
      name: 'Jomo Admin',
      email: 'jomo@autoworld.co.ke',
      password: hashedPassword,
      phone: '+254712345678',
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    console.log('✅ Admin user created');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: wanjiku2025\n`);

    // Create sample customer
    console.log('👤 Creating sample customer...');
    const customerPassword = await bcrypt.hash('Customer@123', 10);
    const customer = await User.create({
      name: 'John Kamau',
      email: 'customer@example.com',
      password: customerPassword,
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

    // Assign category IDs to products
    console.log('📦 Creating products...');
    const productsWithCategories = sampleProducts.map(product => {
      // Assign categories based on tags
      let categoryIndex = 0;
      if (product.tags.includes('suspension') || product.tags.includes('steering')) {
        categoryIndex = 0; // Suspension & Steering
      } else if (product.tags.includes('engine')) {
        categoryIndex = 1; // Engine Parts
      } else if (product.tags.includes('brakes')) {
        categoryIndex = 2; // Braking System
      } else if (product.tags.includes('electrical')) {
        categoryIndex = 3; // Electrical & Ignition
      } else if (product.tags.includes('cooling')) {
        categoryIndex = 4; // Cooling System
      } else if (product.tags.includes('transmission') || product.tags.includes('clutch')) {
        categoryIndex = 5; // Transmission & Clutch
      } else if (product.tags.includes('body') || product.tags.includes('lighting')) {
        categoryIndex = 6; // Body & Exterior
      } else if (product.tags.includes('interior')) {
        categoryIndex = 7; // Interior & Accessories
      }

      return {
        ...product,
        category: createdCategories[categoryIndex]._id
      };
    });

    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${createdProducts.length} products\n`);

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
    console.log(`  Products: ${createdProducts.length}`);
    console.log(`  Users: 2`);
    console.log('\n' + '='.repeat(60) + '\n');

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