const { mysqlClient } = require("../db");

const getCartItems = async (req, res) => {
  try {
    const { user_id } = req.query;

    mysqlClient.query(
      `
          select 
          cart.id,
          cart.qty,
    
          restaurants.id as restaurant_id,
          restaurants.name as restaurant_name,
          restaurants.location as restaurant_location,
          restaurants.img as restaurant_img,
    
          products.id as product_id,
          products.name as product_name,
          products.price as product_price,
          products.description as product_description,
          products.img as product_img

          from cart
          inner join users on cart.user_id = users.id
          inner join restaurants on cart.restaurant_id = restaurants.id
          inner join products on cart.product_id = products.id
    
          where cart.user_id=${user_id};
          `,
      (err, results) => {
        if (err) {
          res.status(400).json({ message: "Error in DB" });
          return;
        }
        const modifiedResults = results.map(row => {
          if (row.restaurant_img) {
            row.restaurant_img = Buffer.from(row.restaurant_img).toString('base64');
          }
          if (row.product_img) {
            row.product_img = Buffer.from(row.product_img).toString('base64');
          }
          return row;
        });
        res.status(200).json({ message: "Data retrieved", data: modifiedResults });
        // res.status(200).json({ message: "Data retrieved", data: results });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", err });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { user_id, restaurant_id, product_id, qty } = req.body;

    mysqlClient.query(
      `insert into cart (user_id, restaurant_id, product_id, qty) values (${user_id}, ${restaurant_id}, ${product_id}, ${qty})`,
      (err, results) => {
        if (err) {
          res.status(400).json({ message: "Error in DB" });
          return;
        }
        res.status(200).json({ message: "Item added to cart retrieved" });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", err });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const { cart_id } = req.params;

    mysqlClient.query(
      `delete from cart where id=${cart_id}`,
      (err, results) => {
        if (err) {
          res.status(400).json({ message: "Error in DB" });
          return;
        }

        res.status(200).json({ message: "Item from cart deleted" });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", err });
  }
};

const updateQty = async (req, res) => {
  try {
    const { cart_id, operation } = req.body;

    const operator = operation === "ADD" ? "+" : "-";

    mysqlClient.query(
      `update cart set qty = qty ${operator} 1 where id=${cart_id}`,
      (err, results) => {
        if (err) {
          console.log(err);
          res.status(400).json({ message: "Error in DB" });
          return;
        }

        res.status(200).json({ message: "Cart item updated" });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", err });
  }
};

const cartController = {
  getCartItems,
  addItemToCart,
  removeItemFromCart,
  updateQty,
};

module.exports = cartController;
