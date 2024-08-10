const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Shop = require("../models/shop");
const sendMail = require("../utilis/sendMail");
const sendToken = require("../utilis/jwtToken");
const { isAuthanticated, isSeller, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const { upload } = require("../multer");
const ErrorHandler = require("../utilis/ErrorHandler");
const sendShopToken = require("../utilis/shopToken");

// Create shop
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });
    if (sellerEmail) {
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
    const fileUrl = path.join("uploads", filename);

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: fileUrl,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
    };
    const newSeller = await Shop.create(seller);
    const activationToken = createActivationToken(seller);
    const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

    try {
      await sendMail({
        email: seller.email,
        subject: "Activate your shop",
        message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email: ${seller.email} to activate your shop`,
        newSeller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Create activation token function
const createActivationToken = (seller) => {
  return jwt.sign({ id: seller._id }, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;
      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalide Token", 400));
      }

      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;
      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      seller = await Shop.create({
        name,
        email,
        password,
        avatar,
        zipCode,
        address,
        phoneNumber,
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login Shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provides all fields!", 400));
      }

      const user = await Shop.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide correct information", 400)
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }
      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out from shop
router.get(
  "/logout",
  isAuthanticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//get shop onfo

router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop avatar

// router.put(
//   "/update-Shop-avatar",
//   isSeller,
//   upload.single("image"),
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const existsUser = await Shop.findById(req.seller._id);
//       const existsAvatarPath = `uploads/${existsUser.avatar}`;

//       fs.unlinkSync(existsAvatarPath);

//       const fileUrl = path.join(req.file.filename);

//       const user = await Shop.findByIdAndUpdate(req.seller._id, {
//         avatar: fileUrl,
//       });

//       res.status(201).json({
//         success: true,
//         user,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   })
// );

router.put(
  "/update-Shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await Shop.findById(req.seller._id);
      if (!existsUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      const existsAvatarPath = path.join(
        __dirname,
        "..",
        "uploads",
        existsUser.avatar
      );
      if (fs.existsSync(existsAvatarPath)) {
        fs.unlinkSync(existsAvatarPath);
      } else {
        console.log(`File not found: ${existsAvatarPath}`);
      }

      const fileUrl = path.join("uploads", req.file.filename);
      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        avatar: fileUrl,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop info

router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not Found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all seller --- for admin
router.get(
  "/admin-all-sellers",
  isAuthanticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

//delete seller--- admin
router.delete(
  "/delete-seller/:id",
  isAuthanticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this ID", 400));
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller Deleted Successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//update seller withdraw methods ---- seller
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// deleted seller withdraw method --- seller
router.delete("/delete-withdraw-method", isSeller, catchAsyncErrors(async(req, res, next) => {
  try {
    const seller = await Shop.findById(req.seller._id);

    if(!seller){
      return next(new ErrorHandler("Seller not found with this ID"))
    }
    seller.withdrawMethod = null;


    await seller.save();

    res.status(201).json({
      success:true,
      seller
    })
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
    
  }
}))

module.exports = router;
