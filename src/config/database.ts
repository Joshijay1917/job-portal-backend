import mongoose from "mongoose"

export const connectToDB = async () => {
    try {
        const connectionInterface = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`Connected to database! host ${connectionInterface.connection.host}`)
    } catch (error) {
        console.error('Failed to connect to database!! ', error)
        process.exit(1)
    }
}