const { v6 } = require("uuid");

const { mysqlClient } = require("../db");

const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      house_number,
      street_name,
      state_name,
      city_name,
      pincode,
      contact_name,
      contact_number
    } = req.body;

    mysqlClient.query(
      `
        select 
          cart.id,
          cart.qty,
    
          restaurants.id as restaurant_id,
          restaurants.name as restaurant_name,
          restaurants.location as restaurant_location,
    
          products.id as product_id,
          products.name as product_name,
          products.price as product_price,
          products.description as product_description

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

        const uuid = v6();

        // Create Master_Order Records
        mysqlClient.query(
          `
          insert into master_orders (uuid, user_id, house_number, street_name, state_name, city_name, pincode, contact_name, contact_number)
          values ('${uuid}', ${user_id}, '${house_number}', '${street_name}', '${state_name}', '${city_name}', '${pincode}','${contact_name}','${contact_number}')
          `,
          (err) => {
            if (err) {
              res.status(400).json({ message: "Error in DB" });
              return;
            }

            const values = results.map((order) => [
              uuid,
              order.restaurant_id,
              order.product_id,
              order.qty,
            ]);

            const query = `
            insert into orders (uuid, restaurant_id, product_id, qty)
            values ?
            `;

            // Create Order Records
            mysqlClient.query(query, [values], (err, results) => {
              if (err) {
                res.status(400).json({ message: "Error in DB" });
                return;
              }

              // Clear cart
              mysqlClient.query(`delete from cart where user_id=${user_id}`);

              res.status(200).json({ message: "Order placed" });
            });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", err });
  }
};

const getOrders = async (req, res) => {
  try {
    const { user_id } = req.query;

    // Step 1: Get the latest UUID for the user
    mysqlClient.query(
      `
      SELECT uuid 
      FROM master_orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
      `,
      [user_id],
      (err, uuidResults) => {
        if (err) {
          console.error(err);
          return res.status(400).json({ message: "Error fetching latest order uuid" });
        }

        if (uuidResults.length === 0) {
          return res.status(404).json({ message: "No orders found for this user" });
        }

        const latestUuid = uuidResults[0].uuid;

        // Step 2: Get all order details for the latest UUID
        mysqlClient.query(
          `
          SELECT 
            mo.id AS master_order_id,
            mo.uuid,
            mo.user_id,
            mo.house_number,
            mo.street_name,
            mo.state_name,
            mo.city_name,
            mo.pincode,
            mo.contact_number,
            mo.contact_name,
            mo.created_at,

            o.id AS order_id,
            o.restaurant_id,
            r.name AS restaurant_name,
            o.product_id,
            p.name AS product_name,
            p.price AS product_price,
            o.qty

          FROM master_orders mo
          LEFT JOIN orders o ON mo.uuid = o.uuid
          LEFT JOIN restaurants r ON o.restaurant_id = r.id
          LEFT JOIN products p ON o.product_id = p.id
          WHERE mo.uuid = ?
          `,
          [latestUuid],
          (err, results) => {
            if (err) {
              console.error(err);
              return res.status(400).json({ message: "Error in DB" });
            }

            const grouped = {};

            results.forEach((row) => {
              if (!grouped[row.uuid]) {
                grouped[row.uuid] = {
                  id: row.master_order_id,
                  uuid: row.uuid,
                  user_id: row.user_id,
                  house_number: row.house_number,
                  street_name: row.street_name,
                  state_name: row.state_name,
                  city_name: row.city_name,
                  pincode: row.pincode,
                  created_at: row.created_at,
                  contact_name: row.contact_name,
                  contact_number: row.contact_number,
                  orders: [],
                };
              }

              if (row.order_id) {
                grouped[row.uuid].orders.push({
                  order_id: row.order_id,
                  restaurant_id: row.restaurant_id,
                  restaurant_name: row.restaurant_name,
                  product_id: row.product_id,
                  product_name: row.product_name,
                  product_price: row.product_price,
                  qty: row.qty,
                });
              }
            });

            const finalData = Object.values(grouped);

            res.status(200).json({ message: "Latest order retrieved", data: finalData });
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", err });
  }
};
const deleteOrder = (req, res) => {
  const { id } = req.params; // This is master_orders.id

  // First, get the uuid of the master_order
  mysqlClient.query(
    `SELECT uuid FROM master_orders WHERE id = ?`,
    [id],
    (err, results) => {
      if (err || results.length === 0) {
        console.error(err);
        return res.status(400).json({ message: "Order not found." });
      }

      const uuid = results[0].uuid;

      // Delete from orders table using uuid
      mysqlClient.query(
        `DELETE FROM orders WHERE uuid = ?`,
        [uuid],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(400).json({ message: "Failed to delete from orders table." });
          }

          // Delete from master_orders table using id
          mysqlClient.query(
            `DELETE FROM master_orders WHERE id = ?`,
            [id],
            (err) => {
              if (err) {
                console.error(err);
                return res.status(400).json({ message: "Failed to delete from master_orders." });
              }

              res.status(200).json({ message: `Order ${id} successfully deleted.` });
            }
          );
        }
      );
    }
  );
};




const ordersController = {
  createOrder,
  getOrders,
  deleteOrder, 
};

module.exports = ordersController;
