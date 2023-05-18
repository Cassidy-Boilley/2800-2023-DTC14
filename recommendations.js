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




module.exports = app;