const mongoose = require('mongoose');
require('dotenv').config();

// Define ServiceCenter schema inline for the seed script
const serviceCenterSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  services: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
  },
  rating: Number,
});

serviceCenterSchema.index({ location: '2dsphere' });
const ServiceCenter = mongoose.model('ServiceCenter', serviceCenterSchema);

// Sample service centers around Dhaka, Bangladesh (23.8103° N, 90.4125° E)
const sampleCenters = [
  {
    name: 'Dhaka Auto Care',
    address: 'Gulshan 1, Dhaka',
    phone: '+880-1234-567890',
    services: ['Oil Change', 'Brake Service', 'Engine Repair', 'Tire Service'],
    location: {
      type: 'Point',
      coordinates: [90.4125, 23.7805], // [lng, lat]
    },
    rating: 4.5,
  },
  {
    name: 'City Car Service Center',
    address: 'Dhanmondi 27, Dhaka',
    phone: '+880-1234-567891',
    services: ['AC Repair', 'Battery Service', 'General Maintenance'],
    location: {
      type: 'Point',
      coordinates: [90.3753, 23.7456],
    },
    rating: 4.2,
  },
  {
    name: 'Express Auto Workshop',
    address: 'Banani DOHS, Dhaka',
    phone: '+880-1234-567892',
    services: ['Engine Diagnostics', 'Transmission Repair', 'Bodywork'],
    location: {
      type: 'Point',
      coordinates: [90.4019, 23.7947],
    },
    rating: 4.7,
  },
  {
    name: 'Mirpur Car Clinic',
    address: 'Mirpur 10, Dhaka',
    phone: '+880-1234-567893',
    services: ['Oil Change', 'Tire Service', 'Brake Service', 'Alignment'],
    location: {
      type: 'Point',
      coordinates: [90.3688, 23.8069],
    },
    rating: 4.0,
  },
  {
    name: 'Uttara Auto Service',
    address: 'Uttara Sector 7, Dhaka',
    phone: '+880-1234-567894',
    services: ['General Maintenance', 'Engine Repair', 'AC Repair'],
    location: {
      type: 'Point',
      coordinates: [90.3996, 23.8752],
    },
    rating: 4.3,
  },
  {
    name: 'Motijheel Motors',
    address: 'Motijheel C/A, Dhaka',
    phone: '+880-1234-567895',
    services: ['Oil Change', 'Battery Service', 'Tire Service'],
    location: {
      type: 'Point',
      coordinates: [90.4175, 23.7331],
    },
    rating: 3.9,
  },
  {
    name: 'Bashundhara Car Care',
    address: 'Bashundhara R/A, Dhaka',
    phone: '+880-1234-567896',
    services: ['Engine Diagnostics', 'Brake Service', 'Suspension', 'Bodywork'],
    location: {
      type: 'Point',
      coordinates: [90.4246, 23.8208],
    },
    rating: 4.6,
  },
  {
    name: 'Mohammadpur Auto Center',
    address: 'Mohammadpur, Dhaka',
    phone: '+880-1234-567897',
    services: ['General Maintenance', 'Oil Change', 'AC Repair'],
    location: {
      type: 'Point',
      coordinates: [90.3585, 23.7655],
    },
    rating: 4.1,
  },
];

async function seedDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing service centers
    console.log('Clearing existing service centers...');
    await ServiceCenter.deleteMany({});
    
    // Insert sample centers
    console.log('Inserting sample service centers...');
    const result = await ServiceCenter.insertMany(sampleCenters);
    console.log(`Successfully inserted ${result.length} service centers`);
    
    // Display inserted centers
    result.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name} - ${center.address}`);
    });
    
    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
