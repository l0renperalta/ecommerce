const express = require('express');
const path = require('path');
const session = require('express-session');
const { engine } = require('express-handlebars');
const passport = require('passport');
const mysqlSession = require('express-mysql-session');
const { database } = require('./credentials');
const flash = require('connect-flash');
const morgan = require('morgan');

// Initializations
const app = express();
app.set('views', path.join(__dirname, 'views'));
require('./lib/passport');

// Settings
app.engine(
   '.hbs',
   engine({
      defaultLayout: 'main',
      layoutsDir: path.join(app.get('views'), 'layouts'),
      partialsDir: path.join(app.get('views'), 'partials'),
      extname: '.hbs',
   })
);
app.set('view engine', 'hbs');

// Middlewares
app.use(
   session({
      secret: 'ecommerce',
      resave: false,
      saveUninitialized: false,
      store: new mysqlSession(database),
   })
);
app.use(morgan('dev'));
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
   app.locals.success = req.flash('success');
   app.locals.message = req.flash('message');
   app.locals.user = req.user;
   next();
});

// Routes
app.use(require('./routes/home'));
app.use(require('./routes/products'));
app.use(require('./routes/authentication'));
app.use(require('./routes/admin'));

app.use(express.static(path.join(__dirname, '/public')));
// Starting server
app.listen(5000, () => console.log(`Server listening on port 5000`));
