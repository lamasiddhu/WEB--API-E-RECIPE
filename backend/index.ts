// Main entry point - starts the Express server
import expressApp from "./src/app";
import { PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";

// Connect to MongoDB database
connectToMongoDB();

// Start listening on specified port
expressApp.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});