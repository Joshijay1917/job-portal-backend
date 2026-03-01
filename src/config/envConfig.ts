export function envConfig() {
    let origins = [] as string[]
    if(process.env.ALLOWED_ORIGINS) {
        origins = process.env.ALLOWED_ORIGINS.split(",")
    }
    return origins
}