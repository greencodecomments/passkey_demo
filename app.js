require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3035;

const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./db/helpers/init'); // Initialize database connection
const sessionStore = new SequelizeStore({
    db: db,
    // table: 'session',   //calling this 'session' appears to cause issues with the session store
    checkExpirationInterval: 15 * 60 * 1000, // 15 minutes - Clean up server-side sessions every 15 minutes
    expiration: 1 * 60 * 60 * 1000 //  1 hour  - Default Expiry for cookies, if not set individually on each cookie
});

const corsOptions = {
    origin: [`localhost:${port}`, `/\.onrender\.com$/`],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1 * 60 * 60 * 1000 // 1 hour
    }
}));

sessionStore.sync(); // Sync the session store with the database
app.use(passport.authenticate('session'));

const path = require('path');
const layouts = require('express-ejs-layouts');
app.use(layouts);
app.set('views', path.join(__dirname,'app/views'));
app.set('layout', 'layouts/application');
app.set('view engine', 'ejs');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(multer().none()); // For parsing multipart/form-data
app.use(cookieParser()); // For parsing cookies
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(require('./app/routes/routes'));

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});