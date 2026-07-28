import mongoose from "mongoose";
import { connectToMongoDB } from "../database/mongodb";

beforeAll(async () => {
    await connectToMongoDB();
});

afterAll(async () => {
    await mongoose.connection.close();
});
