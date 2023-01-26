const express = require('express');
const router = express.Router();
const pool = require('../connection');
const passport = require('passport');
const { isLoggedIn, adminLoggedIn } = require('../lib/authMiddleware');

router.get('/wp-register', (req, res) => {
   res.render('admin/register', { layout: false });
});

router.post(
   '/wp-register',
   passport.authenticate('signup', {
      successRedirect: '/dashboard',
      failureRedirect: '/wp-register',
      failureFlash: true,
   })
);

router.get('/wp-admin', (req, res) => {
   res.render('admin/login', { layout: false });
});

router.post('/wp-admin', (req, res, next) => {
   passport.authenticate('signin', {
      successRedirect: '/dashboard',
      failureRedirect: '/wp-admin',
      failureFlash: true,
   })(req, res, next);
});

// -----------------------------------------------------------------
router.get('/profile', isLoggedIn, (req, res) => {
   res.render('profile');
});

router.get('/dashboard/logout', isLoggedIn, (req, res, next) => {
   req.logOut(req.user, (err) => {
      if (err) return next(err);
      res.redirect('/wp-admin');
   });
});
// -----------------------------------------------------------------

router.get('/dashboard', adminLoggedIn, async (req, res) => {
   res.render('admin/dashboard', { layout: 'admin' });
});

router.get('/dashboard/products', adminLoggedIn, async (req, res) => {
   const products = await pool.query('SELECT * FROM products');
   res.render('admin/list', { layout: 'admin', products });
});

router.get('/dashboard/products/create', adminLoggedIn, (req, res) => {
   res.render('admin/create', { layout: 'admin' });
});

router.post('/dashboard/products/create', adminLoggedIn, async (req, res) => {
   const { name, description, stock, price, image } = req.body;
   const newProduct = {
      name,
      description,
      stock,
      price,
      image,
   };
   await pool.query('INSERT INTO products SET ?', [newProduct]);
   res.redirect('/dashboard/products');
});

router.get('/dashboard/products/edit/:id', adminLoggedIn, async (req, res) => {
   const id = req.params.id;
   const product = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   res.render('admin/edit', { layout: 'admin', product: product[0] });
});

router.post('/dashboard/products/edit/:id', adminLoggedIn, async (req, res) => {
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
   res.redirect('/dashboard/products');
});

router.get('/dashboard/products/delete/:id', adminLoggedIn, async (req, res) => {
   const { id } = req.params;
   await pool.query('DELETE FROM products WHERE id = ?', [id]);
   res.redirect('/dashboard/products');
});

module.exports = router;
