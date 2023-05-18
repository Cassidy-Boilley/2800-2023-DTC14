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
  const averageCaloriesCursor = foodCollection.aggregate([
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

  const result = await foodCollection.find({ calories: { $lt: averageCalories } });

  res.render('recommendations.ejs', { authenticated: true, food: result });
});

//reuse of Josh's code
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