const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurantController');

// GET /api/restaurants
router.get('/restaurants', restaurantsController.getRestaurants);

// GET /api/products/:id
// router.get('/products/:id', restaurantsController.getProducts);

module.exports = router;
