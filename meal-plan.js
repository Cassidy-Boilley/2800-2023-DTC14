const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const fastfoodCollection = require('./models/fastfoodCollection.js');
const mealplanCollection = require('./models/mealplanCollection.js');
const favoriteCollection = require('./models/favoriteCollection.js');
const usersModel = require('./models/users.js');
const ejs = require('ejs');
const dotenv = require('dotenv');
dotenv.config();

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
    res.render('fast-food.ejs', { authenticated: true, fastfood: result });
});

app.get('/meal-plan', async (req, res) => {
    const userId = await usersModel.findOne({
        email: "test@test.ca" //CHANGE THIS WHEN LOGIN IS IMPLEMENTED
    });

    const result = await mealplanCollection.find({
        user_id: userId._id
    });

    const username = "John Doe"

    const startPrompt = `Write a paragraph of less than 120 words which greets a user named ${username}, tells him that" +
        the following list is his meal plan, and summarizes the list`

    async function runCompletion() {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: startPrompt + result,
            max_tokens: 150
        });
        console.log(completion.data.choices[0].text)
        res.render('meal-plan.ejs', { authenticated: true, mealplan: result, message: completion.data.choices[0].text });
    }
    runCompletion();
});

app.post('/save', async (req, res) => {
    const mealId = req.body;
    const route = req.query.route;
    let result;

    const userId = await usersModel.findOne({
        email: "test@test.ca" //CHANGE THIS WHEN LOGIN IS IMPLEMENTED
    });

    if (route === 'fast-food') {
        result = await fastfoodCollection.findOne({
            _id: mealId.mealId
        });
    } else if (route === 'favorite') {
        result = await favoriteCollection.findOne({
            _id: mealId.mealId
        });
    }

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
            vit_c: result.vit_c,
            calcium: result.calcium,
            salad: result.salad,
            vegan: result.vegan,
            user_id: userId._id,
        });
        await addToMealPlan.save();
        if (route === 'fast-food') {
            res.redirect('/fast-food');
        } else if (route === 'favorite') {
            res.redirect('/favorite');
        }
    } catch (error) {
        console.log(error);
    }
});

app.post('/delete', async (req, res) => {
    const mealId = req.body;
    const userId = await usersModel.findOne({
        email: "test@test.ca" //CHANGE THIS WHEN LOGIN IS IMPLEMENTED
    });

    await mealplanCollection.deleteOne({
        _id: mealId.mealId,
        user_id: userId._id,
    });
    res.redirect('/meal-plan');
});

app.post('/assign', async (req, res) => {
    const result = req.body;
    console.log(result.mealId + " " + result.mealType);

    try {
        await mealplanCollection.updateOne(
            { _id: result.mealId },
            { $set: { type: result.mealType } },
        );
        res.redirect('/meal-plan');
    } catch (error) {
        console.log(error);
    }
})

app.post('/unassign', async (req, res) => {
    const result = req.body;

    try {
        await mealplanCollection.updateOne(
            { _id: result.mealId },
            { $set: { type: "" } },
        )
        res.redirect('/meal-plan');
    } catch (error) {
        console.log(error);
    }
});

app.get('/favorite', async (req, res) => {
    const result = await favoriteCollection.find();
    res.render('favorite.ejs', { authenticated: true, fastfood: result });
});

app.post('/favorite', async (req, res) => {
    const mealId = req.body;

    const userId = await usersModel.findOne({
        email: "test@test.ca" //CHANGE THIS WHEN LOGIN IS IMPLEMENTED
    });

    const result = await fastfoodCollection.findOne({
        _id: mealId.mealId
    });

    try {
        const addToFavorites = new favoriteCollection({
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
            vit_c: result.vit_c,
            calcium: result.calcium,
            salad: result.salad,
            vegan: result.vegan,
            user_id: userId._id,
        });
        await addToFavorites.save();
        res.redirect('/fast-food');
    } catch (error) {
        console.log(error);
    }
});

app.post('/unfavorite', async (req, res) => {
    const mealId = req.body;
    const userId = await usersModel.findOne({
        email: "test@test.ca" //CHANGE THIS WHEN LOGIN IS IMPLEMENTED
    });

    await favoriteCollection.deleteOne({
        _id: mealId.mealId,
        user_id: userId._id,
    });
    res.redirect('/favorite');
});


module.exports = app;