const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      throw new Error('MONGODB_URI is not defined');
    }

    // Set mongoose options
    mongoose.set('strictQuery', false);

    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');

    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to DB');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from DB');
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    isConnected = false;
    throw error;
  }
};

module.exports = connectDB;