const db = require("../db");

exports.getRestaurants = (req, res) => {
  const query = "SELECT * FROM restaurants";
  db.query(query, (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

