const db = require("../db");

exports.getProducts = (req, res) => {
  const restaurantId = req.params.id;
  console.log("Restaurant ID:", restaurantId);

  const query = "SELECT * FROM products where restaurant_id=?";
  console.log("Executing query:", query, "with restaurantId:", restaurantId);

  db.query(query, [restaurantId], (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      console.log("No products found for restaurant ID:", restaurantId);
    } else {
      console.log("Products found:", results);
    }

    res.json(results);
  });
};
