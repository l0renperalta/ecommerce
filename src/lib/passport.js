const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const pool = require('../connection');
const { encryptPassword, comparePassword } = require('./helpers');

passport.use(
   'signup',
   new localStrategy(
      {
         usernameField: 'email',
         passwordField: 'password',
         passReqToCallback: true,
      },
      async (req, email, password, done) => {
         const { username } = req.body;
         const newUser = {
            email,
            username,
            password,
         };
         newUser.password = await encryptPassword(password);
         const result = await pool.query('INSERT INTO users SET ?', [newUser]);
         newUser.id = result.insertId;
         return done(null, newUser);
      }
   )
);

passport.use(
   'signin',
   new localStrategy(
      {
         usernameField: 'email',
         passwordField: 'password',
         passReqToCallback: true,
      },
      async (req, email, password, done) => {
         const users = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
         if (users.length > 0) {
            const user = users[0];
            const result = await comparePassword(password, user.password);
            if (result) {
               done(null, user, req.flash('success', `Welcome ${user.username}`));
            } else {
               done(null, false, req.flash('message', 'Invalid credentials'));
            }
         } else {
            return done(null, false, req.flash('message', 'Username does not exists'));
         }
      }
   )
);

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
   const rows = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
   done(null, rows[0]);
});
