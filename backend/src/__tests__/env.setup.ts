// Runs before any application module is imported by a test file — points the
// app at a separate test database so the suite never touches real data,
// regardless of whatever MONGODB_URL is set in the real .env file.
process.env.MONGODB_URL = "mongodb://localhost:27017/erecipe-test-db";
