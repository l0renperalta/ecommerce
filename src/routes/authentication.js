const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/authMiddleware');

router.get('/signup', isNotLoggedIn, (req, res) => {
   res.render('authentication/signup');
});

router.post(
   '/signup',
   isNotLoggedIn,
   passport.authenticate('signup', {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true,
   })
);

router.get('/signin', isNotLoggedIn, (req, res) => {
   res.render('authentication/signin');
});

router.post('/signin', isNotLoggedIn, (req, res, next) => {
   passport.authenticate('signin', {
      successRedirect: '/profile',
      failureRedirect: '/signin',
      failureFlash: true,
   })(req, res, next);
});

router.get('/profile', isLoggedIn, (req, res) => {
   res.render('profile');
});

router.get('/logout', isLoggedIn, (req, res, next) => {
   req.logOut(req.user, (err) => {
      if (err) return next(err);
      res.redirect('signin');
   });
});

module.exports = router;
