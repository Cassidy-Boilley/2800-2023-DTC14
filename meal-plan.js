const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const fastfoodCollection = require('./models/fastfoodCollection.js');
const mealplanCollection = require('./models/mealplanCollection.js');
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

/** RUN THIS CODE ONCE TO GENERATE DESCRIPTIONS FOR ALL ITEMS
app.get('/one-time', async (req, res) => {
    const result = await fastfoodCollection.find();

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const item of result) {
        const startPrompt = `Write a paragraph of 120 words or less which describes the ${item.item} from ${item.restaurant} in a way that would make a user want to eat it.`;

        // Make API call after a delay of 1.5 seconds
        await delay(2000);

        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: startPrompt,
            max_tokens: 150
        });

        await fastfoodCollection.updateOne(
            { item: item.item, restaurant: item.restaurant },
            {
                $set: 
                {
                    description: completion.data.choices[0].text
                }
            }
        );
        console.log("1 item done" + " " + item.item + " " + item.restaurant + " \n" + item.description);
    }
    res.send('Finished');
});
*/


app.get('/fast-food', async (req, res) => {
    if (req.session.GLOBAL_AUTHENTICATED) {
        const userId = await usersModel.findOne({
            email: req.session.loggedEmail
        });

        const result = await fastfoodCollection.find();
        res.render('fast-food.ejs', { fastfood: result, name: userId.name });
    } else {
        res.redirect('/login');
    }
});

app.get('/meal-plan', async (req, res) => {
    if (req.session.GLOBAL_AUTHENTICATED) {
        const userId = await usersModel.findOne({
            email: req.session.loggedEmail
        });

        const result = await mealplanCollection.find({
            user_id: userId._id
        });

        const mealplanItems = result.map((mealplan) => mealplan.item);
        const mealplanRestaurants = result.map((mealplan) => mealplan.restaurant);

        const descriptions = await fastfoodCollection.find(
            {
                item: { $in: mealplanItems },
                restaurant: { $in: mealplanRestaurants }
            },
            { description: 1 }
        );

        const descriptionArray = descriptions.map((desc) => desc.description);

        const username = req.session.loggedName;

        const startPrompt = `Write a paragraph of less than 120 words which greets a user named ${username}, tells him that the following list is his saved meals, and summarizes the list`;

        async function runCompletion() {
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: startPrompt + result,
                max_tokens: 150
            });

            res.render('meal-plan.ejs', {
                authenticated: req.session.GLOBAL_AUTHENTICATED,
                mealplan: result,
                descriptions: descriptionArray,
                message: completion.data.choices[0].text,
                name: userId.name
            });
        }

        runCompletion();
    } else {
        res.redirect('/login');
    }
});






app.post('/saveMeal', async (req, res) => {
    const mealId = req.body;

    const userId = await usersModel.findOne({
        email: req.session.loggedEmail
    });

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
            vit_c: result.vit_c,
            calcium: result.calcium,
            salad: result.salad,
            vegan: result.vegan,
            user_id: userId._id,
        });
        await addToMealPlan.save();
        res.redirect('/fast-food');
    } catch (error) {
        console.log(error);
    }
});

app.post('/delete', async (req, res) => {
    const mealId = req.body;
    const userId = await usersModel.findOne({
        email: req.session.loggedEmail
    });

    await mealplanCollection.deleteOne({
        _id: mealId.mealId,
        user_id: userId._id,
    });
    res.redirect('/meal-plan');
});

module.exports = app;