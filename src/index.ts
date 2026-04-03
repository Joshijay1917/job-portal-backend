import { app } from "./app.js";
import { connectToDB } from "./config/database.js";
import { pool } from "./config/db.js";

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    connectToDB()
    pool.connect();
    console.log(`Server is running on port ${PORT}`)
})