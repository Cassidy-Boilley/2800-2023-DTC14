const express = require('express');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
app.set('view engine', 'ejs');
app.use(express.static('public'));

const bcrypt = require('bcrypt');
const Joi = require('joi');
var MongoDBStore = require('connect-mongodb-session')(session);
const dotenv = require('dotenv');
const e = require('express');
dotenv.config();

var dbStore = new MongoDBStore({
  uri: process.env.MDB_CONNECTION_STRING,
  collection: 'test'
});

app.get('/', (req, res) => {
    // CHANGE AUTHENTICATED CONDITION WHEN IMPLEMENTATION IS DONE
    res.render('index.ejs', { authenticated: true });
    }
);

app.get('/recommendations', async(req, res) => {
    res.render('recommendations.ejs', { authenticated: true });
    
});

module.exports = app;