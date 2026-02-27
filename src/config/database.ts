import mongoose from "mongoose"

const db_url = process.env.MONGO_URI ? process.env.MONGO_URI : 'mongodb://localhost:27017/AuthSystem'

export const connectToDB = async () => {
    try {
        const connectionInterface = await mongoose.connect(db_url)
        console.log(`Connected to database! host ${connectionInterface.connection.host}`)
    } catch (error) {
        console.error('Failed to connect to database!! ', error)
        process.exit(1)
    }
}