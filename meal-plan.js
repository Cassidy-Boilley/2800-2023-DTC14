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

app.get('/fast-food', async (req, res) => {
    const result = await fastfoodCollection.find();
    console.log(result);
    res.render('fast-food.ejs', { authenticated: true, fastfood: result });
});

app.get('/meal-plan', async (req, res) => {
    const result = await mealplanCollection.find();
    console.log(result);
    res.render('meal-plan.ejs', { authenticated: true, mealplan: result });
});

module.exports = app;