import dotenv from "dotenv";
dotenv.config(); // implement .env file

// Add fallback value from env for stability
export const PORT: number = Number(process.env.PORT) || 8089; // default port is 8089
export const DUMMY: string = process.env.DUMMY || "Dummy Export";    
export const MONGODB_URL: string =
    process.env.MONGODB_URL || "mongodb://localhost:27017/erecipe-db"; // default MongoDB URL
export const SECRET_KEY: string =
    process.env.SECRET_KEY || "merosecretkey";
export const EMAIL_USER: string = process.env.EMAIL_USER || "";
export const EMAIL_APP_PASSWORD: string = process.env.EMAIL_APP_PASSWORD || "";
export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || "";
export const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY || "";
// same as 
// export {
//     PORT,
//     DUMMY,
//     MONGODB_URL
// }