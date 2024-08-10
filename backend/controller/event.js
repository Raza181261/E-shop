const express = require("express");
const router = express.Router();

const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Shop = require("../models/shop");
const ErrorHandler = require("../utilis/ErrorHandler");
const Event = require("../models/event");
const {isSeller, isAdmin, isAuthanticated} = require("../middleware/auth");


//create event
router.post(
  "/create-event",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      

      if (!shop) {
        return next(new ErrorHandler("Shop id is invalid", 400));
      } else {
        const files = req.files;
        const imagesUrls = files.map((file) => `${file.filename}`);
        const eventData = req.body;
        eventData.images = imagesUrls;
        eventData.shop = shop;

        const products = await Event.create(eventData);
         
        res.status(201).json({
          success: true,
          products,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);


// get all events
router.get("/get-all-events", async(req, res, next) => {
  try {
    const events = await Event.find();
    res.status(201).json({
      success: true,
      events, 
    })
  } catch (error) {
    return next(new ErrorHandler(error, 400));
    
  }
})


//get all event for a shop
router.get("/get-all-events/:id", catchAsyncErrors(async(req, res, next) => {
  try {
    const events = await Event.find({shopId: req.params.id})

    res.status(201).json({
      success: true,
      events

    })
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


// delete event of a shop
router.delete("/delete-shop-event/:id", catchAsyncErrors(async(req, res, next) => {
  try {
    const productId = req.params.id;

    const EventData = await Event.findById(productId)

    EventData.images.forEach((imageUrl) => {
      const filename = imageUrl;
      const filePath = `uploads/${filename}`;

      fs.unlink(filePath, (err) => {
        if(err){
          console.log(err);
        };
      });
    });
    
    const event = await Event.findByIdAndDelete(productId)

    if(!event){
      return next(new ErrorHandler("Event not found with this id!", 500))
    }

    res.status(201).json({
      success: true,
      message: "Event deleted successfully!",
    })

  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
}))


// all events --- for admin
router.get(
  "/admin-all-events",
  isAuthanticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;
