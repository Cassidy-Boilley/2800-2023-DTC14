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
  if(req.session.GLOBAL_AUTHENTICATED) {
    const user = await usersModel.findOne({
    email: req.session.loggedEmail
  })

  const averageCaloriesCursor = mealplanCollection.aggregate([
    {
      $group: {
        _id: user._id,
        averageCalories: { $avg: "$calories" }
      }
    }
  ]);

  const averageCaloriesDoc = await averageCaloriesCursor.exec();
  averageCalories = averageCaloriesDoc[0].averageCalories;
  console.log(averageCalories);

  const result = await foodCollection.find({ calories: { $lt: averageCalories } }).limit(10);
  

  const startPrompt = "Write a paragraph of less than 100 words which greets a user named" + user.name + 
  " tells him that the following list is his recommendations, and summarizes the list\n"
  const chatReturn = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: startPrompt + result,
    max_tokens: 150
  });
  const message = chatReturn.data.choices[0].text  


    res.render('recommendations.ejs', { authenticated: true, food: result, message: message, name: user.name });
  } else {
    res.redirect('/login');
  }
});

app.post('/isVegan', async (req, res) => {
  if(req.session.GLOBAL_AUTHENTICATED){
    const user = await usersModel.findOne({
    email: req.session.loggedEmail
    });
    console.log(averageCalories);
    const result = await foodCollection.find({ vegan: true}).limit(10);

    const startPrompt = "Write a paragraph of less than 100 words which greets a user named" + user.name + 
    " tells him that the following list is his recommendations, and summarizes the list\n"
    const chatReturn = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: startPrompt + result,
      max_tokens: 150
    });
    const message = chatReturn.data.choices[0].text 

      res.render('recommendations.ejs', { authenticated: true, food: result, name: user.name, message: message });
    } else {
      res.redirect('/login');
  }

});

app.post('/save', async (req, res) => {
  if(req.session.GLOBAL_AUTHENTICATED){
    const user = await usersModel.findOne({
    email: req.session.loggedEmail
  })
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
      vit_c: result.vit_c,
      calcium: result.calcium,
      salad: result.salad,
      vegan: result.vegan,
      user_id: user._id,
    });
    await addToMealPlan.save();
    res.redirect('/recommendations');
  } catch (error) {
    console.log(error);
    }
  } else {
    res.redirect('/login');
  } 

});

app.get("*", async (req, res) => {
  if(req.session.GLOBAL_AUTHENTICATED) {
    const user = await usersModel.findOne({
    email: req.session.loggedEmail
  })
    res.status(404).render('404.ejs', { name: user.name });
  } else {
    res.redirect('/login');
  } 
});
module.exports = app;