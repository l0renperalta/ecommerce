const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../lib/authMiddleware');

router.get('/', (req, res) => {
   res.render('home');
});

module.exports = router;
