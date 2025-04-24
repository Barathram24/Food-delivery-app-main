const express = require("express");
const router = express.Router();

const productController = require("../controller/productController");

// Route to get products by restaurant ID
router.get("/:id", productController.getProducts);

module.exports = router;

