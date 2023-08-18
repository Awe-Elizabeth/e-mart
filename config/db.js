const mongoose = require('mongoose');



const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
        // keepAlive: true,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.bold.underline)
}

module.exports = connectDB