const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lrc_connect';
        
        // Remove useNewUrlParser and useUnifiedTopology - they're no longer needed
        await mongoose.connect(mongoURI);
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📦 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;