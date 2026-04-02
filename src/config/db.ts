import { Pool } from "pg"

const isProduction = process.env.NODE_ENV === "production"

const devConfig = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

console.log("Running.. ", devConfig)

export const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : devConfig,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
})

export const query = (text: string, params?: any[]) => pool.query(text, params)