import { app } from "./app.js";
import { connectToDB } from "./config/database.js";

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    connectToDB()
    console.log(`Server is running on port ${PORT}`)
})