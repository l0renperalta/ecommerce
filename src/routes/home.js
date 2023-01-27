const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../lib/authMiddleware');

router.get('/', (req, res) => {
   res.render('home');
});

router.get('/contact', (req, res) => {
   res.render('contact');
});

router.get('/about', (req, res) => {
   res.render('about');
});

module.exports = router;
