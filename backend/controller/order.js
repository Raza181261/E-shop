const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utilis/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const { isAuthanticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../models/order");
const Product = require("../models/product");
const Shop = require("../models/shop")
// create new order

router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      // group cart items by shopid
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // create an order for each shop

      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

//get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// update order status for seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      if (req.body.status === "Transferred to delivery partner") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharges = order.totalPrice * .10;
        await updateSellerInfo(order.totalPrice - serviceCharges)
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);
        product.stock -= qty;
        product.sold_out += qty;

        await product.save({ validateBeforeSave: false });
      }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id);
        seller.availableBalance = amount;
       
        await seller.save()
      }
      
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// give a refund ---- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request Successfull!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// accept refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this Id!", 400));
      }
      order.status = req.body.status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund Successfully!",
      });

      if (req.body.status === "Refund success") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);
        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthanticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;
