const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const fastfoodCollection = require('./models/fastfoodCollection.js');
const mealplanCollection = require('./models/mealplanCollection.js');
const ejs = require('ejs');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.post('/save', async (req, res) => {
    const mealId = req.body;
    const result = await fastfoodCollection.findOne({
        _id: mealId.mealId
    });

    try {
        const addToMealPlan = new mealplanCollection({
        restaurant: result.restaurant,
        item: result.item,
        calories: result.calories,
        cal_fat: result.cal_fat,
        total_fat: result.total_fat,
        sat_fat: result.sat_fat,
        trans_fat: result.trans_fat,
        cholesterol: result.cholesterol,
        sodium: result.sodium,
        total_carb: result.total_carb,
        fiber: result.fiber,
        sugar: result.sugar,
        protein: result.protein,
        vit_a: result.vit_a,
        vit_c:  result.vit_c,
        calcium: result.calcium,
        salad: result.salad
    });
    await addToMealPlan.save();
    res.redirect('/fast-food');
    } catch (error) {
        console.log(error);
    }
});

module.exports = app;