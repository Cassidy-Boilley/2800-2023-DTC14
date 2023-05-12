const express = require('express');
const mongoose = require('mongoose');
const app = express();
const fastfoodCollection = require('./models/fastfoodCollection.js');
const mealplanCollection = require('./models/mealplanCollection.js');
const ejs = require('ejs');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    // CHANGE AUTHENTICATED CONDITION WHEN IMPLEMENTATION IS DONE
    res.render('index.ejs', { authenticated: true });
});

app.get('/meal-plan', async (req, res) => {
    const result = await fastfoodCollection.find();
    console.log(result);
    res.render('meal-plan.ejs', { authenticated: true, result: result });
});

module.exports = app;