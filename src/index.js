const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

// Initializations
const app = express();
app.set('views', path.join(__dirname, 'views'));

// Settings
app.use(express.urlencoded({ extended: true }));
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

// Routes
app.use(require('./routes/products'));

// Starting server
app.listen(5000, () => console.log(`Server listening on port 5000`));
