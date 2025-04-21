const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ Import path
const app = express();
const port = 3000;

// Route imports
const restaurantsRoutes = require("./routes/restaurantRoutes.js");
const productRoutes = require("./routes/productRoutes.js");

app.use(cors());
app.use(express.json());

// ✅ Serve static image files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route usage
app.use("/restaurants", restaurantsRoutes);
app.use("/products", productRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
