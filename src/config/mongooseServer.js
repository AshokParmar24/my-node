const mongoose = require("mongoose");



const connect = async () => {
    try {
        await mongoose.connect(process.env.MOONGOSE_SERVER_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

const disconnect = async () => {
    try {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
}

module.exports = { connect, disconnect }