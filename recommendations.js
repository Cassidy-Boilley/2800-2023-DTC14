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
const foodCollection = require('./models/foodcollection.js');


app.get('/', (req, res) => {
    // CHANGE AUTHENTICATED CONDITION WHEN IMPLEMENTATION IS DONE
    res.render('index.ejs', { authenticated: true });
    }
);

app.get('/recommendations', async (req, res) => {
    const result = await foodCollection.find();
    console.log(result);
    res.render('recommendations.ejs', { authenticated: true, food: result });
    
});

app.get('/maxCalo', async (req, res) => {
    const result = await foodCollection.find({ calories: { $lt: 500 }});
    console.log(result);
    res.render('recommendations.ejs', { authenticated: true, food: result });
    
});

app.get('/isVegan', async (req, res) => {
    const result = await foodCollection.find({ vegan: true });
    console.log(result);
    res.render('recommendations.ejs', { authenticated: true, food: result });
    
});

module.exports = app;