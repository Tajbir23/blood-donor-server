import mongoose from "mongoose"

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blood_donation')
        console.log('Connected to MongoDB')
    } catch (err) {
        console.log('Error connecting to MongoDB', err)
    }
}

export default connection