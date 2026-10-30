import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose ODM with fallback
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb_p10';
  try {
    console.log(`⏳ Connecting to MongoDB at: ${uri}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ Primary MongoDB Connection Failure: ${error.message}`);
    try {
      console.log(`🔄 Attempting fallback connection to local MongoDB 127.0.0.1:27017...`);
      const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/taskdb_p10');
      console.log(`✅ Fallback Local MongoDB Connected: ${fallbackConn.connection.host}/${fallbackConn.connection.name}`);
      return fallbackConn;
    } catch (fallbackErr) {
      console.error(`❌ Local MongoDB Fallback also failed: ${fallbackErr.message}`);
    }
  }
};
