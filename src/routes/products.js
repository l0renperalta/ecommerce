const express = require('express');
const router = express.Router();
const pool = require('../connection');

router.get('/products', async (req, res) => {
   const products = await pool.query('SELECT * FROM products');
   res.render('products/list', { products });
});

router.get('/products/:id', async (req, res) => {
   const id = req.params.id;
   const product = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   res.render('products/details', { product: product[0] });
});

router.get('/products/create', (req, res) => {
   res.render('products/create');
});

router.post('/products/create', async (req, res) => {
   const { name, description, stock, price, image } = req.body;
   const newProduct = {
      name,
      description,
      stock,
      price,
      image,
   };
   await pool.query('INSERT INTO products SET ?', [newProduct]);
   res.redirect('products/list');
});

router.get('/products/edit/:id', async (req, res) => {
   const id = req.params.id;
   const product = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
   res.render('products/edit', { product: product[0] });
});

router.post('/products/edit/:id', async (req, res) => {
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

router.get('/products/delete/:id', async (req, res) => {
   const { id } = req.params;
   await pool.query('DELETE FROM products WHERE id = ?', [id]);
   res.redirect('/products');
});

module.exports = router;
