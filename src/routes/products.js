const { application } = require('express');
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
   res.render('products/details', { product: product[0] });
});

router.get('/cart', (req, res) => {
   const cart = req.session.cart;
   res.render('products/cart', { cart: cart });
});

// Add product to shopping cart
router.get('/products/:id', async (req, res) => {
   const cart = req.session.cart ? req.session.cart : [];
   req.session.total = req.session.total ? req.session.total : 0;
   const id = parseInt(req.params.id);
   const productStored = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   const initialPrice = productStored[0].price;

   // Check if product is already added to cart
   if (cart.some((e) => e.id === id)) {
      // find product from cart
      const product = cart.find((e) => e.id === id);
      // Increase quantity and modifies total price
      product.quantity++;
      product.itemTotalPrice = initialPrice * product.quantity;
   } else {
      cart.push({
         id: productStored[0].id,
         image: productStored[0].image,
         name: productStored[0].name,
         itemPrice: productStored[0].price,
         itemTotalPrice: productStored[0].price,
         quantity: 1,
      });
   }
   req.session.cart = cart;
   req.session.totalPrice = cart.map((e) => e.itemTotalPrice).reduce((acc, curr) => acc + curr);
   res.redirect(`/cart`);
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
      console.log(req.session.totalPrice - initialPrice);
      req.session.totalPrice = req.session.totalPrice - initialPrice;
   } else {
      cart.splice(index, 1);
      req.session.totalPrice = req.session.totalPrice - initialPrice;
   }
   req.session.cart = cart;
   res.redirect('/cart');
});

router.get('/checkout', (req, res) => {
   const cart = req.session.cart;
   let count = 1;
   res.render('products/checkout', { cart, count });
});

module.exports = router;
