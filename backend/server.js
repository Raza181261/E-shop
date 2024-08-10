// 

const app = require("./app");
const connectDatabase = require("./db/Database");
const cloudinary = require("cloudinary");

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to uncaught exception");
    process.exit(1);
});

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "config/.env" });
}

console.log(process.env.DB_URL);

// Connect to the database
connectDatabase();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

// Create server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log(`Shutting down the server due to ${err.message}`);
    console.log("Shutting down the server due to unhandled promise rejection");

    server.close(() => {
        process.exit(1);
    });
});
