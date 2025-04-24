// src/controllers/restaurantController.js
const db = require("../db");

const getRestaurants = async (req, res) => {
  try {
    db.query("SELECT * FROM restaurants", (err, results) => {
      if (err) {
        console.log(err);
        res.status(400).json({ message: "Error in DB" });
        return;
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", err });
  }
};

module.exports = { getRestaurants };
