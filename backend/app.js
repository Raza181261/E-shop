// const express = require("express");
// const ErrorHandler = require("./utilis/ErrorHandler");
// const app = express();
// const cookieParser = require("cookie-parser");
// const bodyParser = require("body-parser");
// const cors = require("cors");


// app.use(express.json());
// app.use(cookieParser());
// app.use(cors());
// app.use("/", express.static("uploads"));
// app.use(bodyParser.urlencoded({extended:true , limit:"50mb"}));


// //config
// if(process.env.NODE_ENV !== "PRODUCTION"){
//     require("dotenv").config({
//         path:"backend/config/.env"
//     })
// }


// // import router from controller(user) file
// const user = require("./controller/user")
// app.use("/api/v2/user", user)


// //its for Error handler
// app.use(ErrorHandler);

// module.exports = app;
 
const express = require("express");
const ErrorHandler = require("./middleware/Error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/.env" });
}

// Import router from controller(user) file
const user = require("./controller/user");
app.use("/api/v2/user", user);

// Error handling middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong MongoDB ID error
    if (err.name === "CastError") {
        const message = `Resource not found with this ID. Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate key ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = "Your URL is invalid. Please try again later!";
        err = new ErrorHandler(message, 400);
    }

    // JWT expired error
    if (err.name === "TokenExpiredError") {
        const message = "Your URL has expired. Please try again later!";
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
});

module.exports = app;
