const express = require('express');
const router = express.Router();
const pool = require('../connection');
const { isLoggedIn, isNotLoggedIn } = require('../lib/authMiddleware');

router.get('/products', async (req, res) => {
   const products = await pool.query('SELECT * FROM products');
   res.render('products/list', { products });
});

router.get('/products/details/:id', async (req, res) => {
   const id = req.params.id;
   const product = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   // req.session.destroy();
   // console.log(req.session);
   res.render('products/details', { product: product[0] });
});

router.get('/products/create', isLoggedIn, (req, res) => {
   res.render('products/create');
});

router.post('/products/create', isLoggedIn, async (req, res) => {
   const { name, description, stock, price, image } = req.body;
   const newProduct = {
      name,
      description,
      stock,
      price,
      image,
   };
   await pool.query('INSERT INTO products SET ?', [newProduct]);
   res.redirect('/products');
});

router.get('/products/edit/:id', isLoggedIn, async (req, res) => {
   const id = req.params.id;
   const product = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   res.render('products/edit', { product: product[0] });
});

router.post('/products/edit/:id', isLoggedIn, async (req, res) => {
   const id = req.params.id;
   const { name, description, stock, price, image } = req.body;
   const newValues = {
      name,
      description,
      stock,
      price,
      image,
   };
   await pool.query('UPDATE products SET ? WHERE id = ?', [newValues, id]);
   res.redirect('/products');
});

router.get('/products/delete/:id', isLoggedIn, async (req, res) => {
   const { id } = req.params;
   await pool.query('DELETE FROM products WHERE id = ?', [id]);
   res.redirect('/products');
});

router.get('/products/:id', async (req, res) => {
   const cart = req.session.cart ? req.session.cart : [];
   const id = parseInt(req.params.id);
   const product = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   const initialPrice = product[0].price;
   if (cart.some((e) => e.id === id)) {
      const product = cart.find((e) => e.id === id);
      product.quantity++;
      product.price = initialPrice * product.quantity;
   } else {
      cart.push({
         id: product[0].id,
         image: product[0].image,
         productName: product[0].name,
         price: product[0].price,
         quantity: 1,
      });
   }
   req.session.cart = cart;
   res.redirect(`/products/details/${req.params.id}`);
});

router.get('/cart', (req, res) => {
   const cart = req.session.cart;
   res.render('products/cart', { cart: cart });
});

router.get('/checkout', (req, res) => {
   res.render('products/checkout');
});

router.get('/removeItem/:id', async (req, res) => {
   const id = parseInt(req.params.id);
   const cart = req.session.cart;
   const index = cart.findIndex((e) => e.id === id);
   const product = cart[index];
   const storedProduct = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   const initialPrice = storedProduct[0].price;

   if (product.quantity > 1) {
      product.quantity = --product.quantity;
      product.price = product.price - initialPrice;
   } else {
      cart.splice(index, 1);
   }
   req.session.cart = cart;
   res.redirect('/cart');
});

module.exports = router;
