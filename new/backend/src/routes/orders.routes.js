const express = require("express");

const ordersController = require("../controllers/orders.controller.js");

const router = express.Router();

router.get("/", ordersController.getOrders);
router.post("/", ordersController.createOrder);
router.delete('/orders/:id', ordersController.deleteOrder);

module.exports = router;
