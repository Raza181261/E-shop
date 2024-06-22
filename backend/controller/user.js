// const express = require("express");
// const path = require("path");
// const router = express.Router();

// const { upload } = require("../multer");
// const ErrorHandler = require("../utilis/ErrorHandler");
// const User = require("../models/user");
// const fs = require("fs");
// const jwt = require("jsonwebtoken");
// const sendMail = require("../utilis/sendMail");

// router.post("/create-user", upload.single("file"), async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;
//     const userEmail = await User.findOne({ email });

//     if (userEmail) {
//       const filename = req.file.filename;
//       const filePath = `uploads/${filename}`;
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.log(err);
//           res.status(500).json({ message: "Error deleting file" });
//         } else {
//           res.json({ message: "File deleted successfully" });
//         }
//       });
//       return next(new ErrorHandler("User already exists ", 400));
//     }

//     const filename = req.file.filename;
//     const fileUrl = path.join(filename);

//     const user = {
//       name: name,
//       email: email,
//       password: password,
//       avatar: fileUrl,
//     };

//     //await user.save();
//     console.log(user);

//     const newUser = await User.create(user);
//     res.status(201).json({
//       success: true,
//       newUser,
//     });

//     const activationToken = createActivationToken(user);
//     const activationUrl = `http://localhost:3000/activation/${activationToken}`;

//     try {
//       await sendMail({
//         email: user.email,
//         subject: "Activate your account",
//         message: `Hello ${user.name} please click on the link to avtivate your account: ${activationUrl}`,
//       });
//       res.status(201).json({
//         success: true,
//         message: `please check your email:- ${user.email} to activate your account`,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// });

// // create activation token
// const createActivationToken = (user) => {
//   return jwt.sign(user, process.env.ACTIVATION_SECRET, {
//     expiresIn: "5m",
//   });
// };

// module.exports = router;

const express = require("express");
const path = require("path");
const router = express.Router();

const { upload } = require("../multer");
const ErrorHandler = require("../utilis/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/user");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utilis/sendMail");
const sendToken = require("../utilis/jwtToken")

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
                  
          // Note: Do not send a response here, instead log the error
        }
      });
      return next(new ErrorHandler("User already exists", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join('uploads', filename);

    const user = {
      name: name,
      email: email,
      password: password,
      avatar: fileUrl,
    };

    const newUser = await User.create(user);

    const activationToken = createActivationToken(user);
    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account`,
        newUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Create activation token function
const createActivationToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// activate user
router.post("/activation", catchAsyncErrors(async(req, res, next) => {
  try {
    const {activation_token} = req.body;
    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    if(!newUser){
      return next (new ErrorHandler("Invalide Token", 400))
    }

    const{name, email, password, avatar} = newUser;
    let user = await User.findOne({email});

    if(user){
      return next(new ErrorHandler("User already exists", 400))
    }

    User.create({
      name,
      email,
      password,
      avatar,
    })

    sendToken(newUser, 201, res);
  } catch (error) {
    return next (new ErrorHandler(error.message,500))
  }
}))

//load user

module.exports = router;
