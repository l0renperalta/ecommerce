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
   // req.session.destroy();
   // console.log(req.session);
   if (!req.session.totalPrice) {
      req.session.totalPrice = 0;
   }
   console.log(req.session);
   res.render('products/details', { product: product[0] });
});

router.get('/products/:id', async (req, res) => {
   const cart = req.session.cart ? req.session.cart : [];
   const id = parseInt(req.params.id);
   const product = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   const initialPrice = product[0].price;
   if (cart.some((e) => e.id === id)) {
      const product = cart.find((e) => e.id === id);
      product.quantity++;
      product.itemTotalPrice = initialPrice * product.quantity;
      req.session.totalPrice = req.session.totalPrice
         ? cart.reduce((acc, curr) => curr.itemTotalPrice + acc.itemTotalPrice)
         : 0;
   } else {
      cart.push({
         id: product[0].id,
         image: product[0].image,
         name: product[0].name,
         itemPrice: product[0].price,
         itemTotalPrice: product[0].price,
         quantity: 1,
      });
      req.session.totalPrice = req.session.totalPrice
         ? cart.reduce((acc, curr) => curr.itemTotalPrice + acc.itemTotalPrice)
         : 0;
   }
   req.session.cart = cart;
   res.redirect(`/products/details/${req.params.id}`);
});

router.get('/cart', (req, res) => {
   const cart = req.session.cart;
   console.log(req.session.totalPrice);
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
