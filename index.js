const express = require('express');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
var MongoDBStore = require('connect-mongodb-session')(session);
const dotenv = require('dotenv');
dotenv.config();


app.get('/', (req, res) => {
    // CHANGE AUTHENTICATED CONDITION WHEN IMPLEMENTATION IS DONE
    res.render('index.ejs', { authenticated: true });
    }
);


module.exports = app;