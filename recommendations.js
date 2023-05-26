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
const usersModel = require('./models/users');
const foodCollection = require('./models/foodcollection.js');
const mealplanCollection = require('./models/mealplanCollection.js');

let averageCalories = 0;

const { Configuration, OpenAIApi } = require("openai"); // OpenAI API Setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,  
});
const openai = new OpenAIApi(configuration);



app.get('/recommendations', async (req, res) => {
  if (req.session.GLOBAL_AUTHENTICATED) {// Check if user is logged in
    
    const user = await usersModel.findOne({
    email: req.session.loggedEmail
  })

  const averageCaloriesCursor = mealplanCollection.aggregate([ // Get average calorie count of users meal plans
    {
      $group: {
        _id: user._id,
        averageCalories: { $avg: "$calories" }
      }
    }
  ]);

  const averageCaloriesDoc = await averageCaloriesCursor.exec(); // Execute query
  averageCalories = averageCaloriesDoc[0].averageCalories; // Set averageCalories variable to the average calories of the users meal plans
  console.log(averageCalories);
  
  // Get food items with calories less than the average calories of the users meal plans
  const result = await foodCollection.find({ calories: { $lt: averageCalories } }).limit(10);
  
  // Generate a paragraph of text using the OpenAI API
  const startPrompt = "Write a paragraph of less than 100 words which greets a user named" + user.name + 
  " tells him that the following list is his recommendations, and summarizes the list\n"
  const chatReturn = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: startPrompt + result,
    max_tokens: 150
  });
  const message = chatReturn.data.choices[0].text  // Set message variable to the generated text

    // Render the recommendations page with the food items and the generated text
    res.render('recommendations.ejs', { authenticated: true, food: result, message: message, name: user.name });
  } else {
    res.redirect('/login'); // Redirect to login page if user is not logged in
  }
});

app.post('/isVegan', async (req, res) => { // A GET action that recommends vegan food items
  if(req.session.GLOBAL_AUTHENTICATED){ // Check if user is logged in
    const user = await usersModel.findOne({ // Find user
    email: req.session.loggedEmail
    });

    const result = await foodCollection.find({ vegan: true}).limit(10); // Find vegan food items

    const startPrompt = "Write a paragraph of less than 100 words which greets a user named" + user.name + 
    " tells him that the following list is his recommendations, and summarizes the list\n"
    const chatReturn = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: startPrompt + result,
      max_tokens: 150
    });
    const message = chatReturn.data.choices[0].text // Set message variable to the generated text

    // Render the recommendations page with the food items and the generated text
      res.render('recommendations.ejs', { authenticated: true, food: result, name: user.name, message: message });
    } else {
      res.redirect('/login');// Redirect to login page if user is not logged in
  }

});

app.post('/save', async (req, res) => { // A POST action that saves a food item to the users meal plan

  if(req.session.GLOBAL_AUTHENTICATED){ // Check if user is logged in
    const user = await usersModel.findOne({ // Find user
    email: req.session.loggedEmail
    })
    
  const mealId = req.body; // Get the food item id from the form
  const result = await foodCollection.findOne({ // Find the food item
    _id: mealId.mealId
  });

  try {
    const addToMealPlan = new mealplanCollection({ // Create a new meal plan item
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
      user_id: user._id,
    });
    await addToMealPlan.save(); // Save the meal plan item
    res.redirect('/recommendations'); 
  } catch (error) {
    console.log(error);
    }
  } else {
    res.redirect('/login'); // Redirect to login page if user is not logged in
  } 

});

module.exports = app;