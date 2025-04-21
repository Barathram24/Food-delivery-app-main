const express = require("express");
const router = express.Router();
const restaurantController = require("../controller/restaurantController"); // ✅ Correct import

router.get("/", restaurantController.getRestaurants);


module.exports = router;
