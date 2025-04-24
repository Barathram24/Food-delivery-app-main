const express = require("express");
const cors = require("cors");
const db = require('./src/db');
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello Bharath hai" });
});

app.post("/add-to-cart", (req, res) => {
  const data = req.body;

  res.status(200).json({ message: "Food item added to cart", data });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
