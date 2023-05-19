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
const mealplanCollection = require('./models/mealplanCollection.js');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


app.get('/', (req, res) => {
    // CHANGE AUTHENTICATED CONDITION WHEN IMPLEMENTATION IS DONE
    res.render('index.ejs', { authenticated: true });
    }
);

app.get('/recommendations', async (req, res) => {
  const averageCaloriesCursor = mealplanCollection.aggregate([
    {
      $group: {
        _id: null,
        averageCalories: { $avg: "$calories" }
      }
    }
  ]);

  const averageCaloriesDoc = await averageCaloriesCursor.exec();
  const averageCalories = averageCaloriesDoc[0].averageCalories;
  console.log(averageCalories);

  const result = await mealplanCollection.find({ calories: { $lt: averageCalories } }).sort({restaurant: 1, calories: 1});

  const startPrompt = "Write a paragraph of less than 120 words which greets a user named Bob, tells him that" +
    "the following list is his recommendations, and summarizes the list"

  async function runCompletion() {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: startPrompt + result,
      max_tokens: 150
    });
    console.log(completion.data.choices[0].text)
    res.render('recommendations.ejs', { authenticated: true, food: result, message: completion.data.choices[0].text });
  }
  runCompletion();

  // res.render('recommendations.ejs', { authenticated: true, food: result });
});

//reuse of Josh's code
app.post('/save', async (req, res) => {
    const mealId = req.body;
    const result = await foodCollection.findOne({
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
        salad: result.salad,
        vegan: result.vegan,
    });
    await addToMealPlan.save();
    res.redirect('/recommendations');
    } catch (error) {
        console.log(error);
    }
});

module.exports = app;