// const ErrorHandler = require("../utilis/ErrorHandler");

// module.exports = (err, req, res, next) => {
//     err.statusCode = err.statusCode || 500
//     err.message = err.message || "internal server Error"

//     //wrong mongoDB id error

//     if(err.name === "CastError"){
//         const message = `Resources not found with this id... Invalid ${err.path}`;
//         err = new ErrorHandler(message, 400);
//     }

//     //Duplicate key error
//     if(err.code === 11000){
//         const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
//         err = new ErrorHandler(message, 400);
//     }

//     //wrong jwt
//     if(err.name === "JsonWebTokenError"){
//         const message = `Your url is invalid Please try again later!`;
//         err = new ErrorHandler(message, 400)
//     }

//     // if jwt Expired
//     if(err.name === "TokenExpiredError"){
//         const message = `Your url is expired Please try again later!`;
//         err = new ErrorHandler(message, 400)
//     }

//     res.status(err.statusCode).json({
//         success: false,
//         message: err.message
//     })
// }

class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;
