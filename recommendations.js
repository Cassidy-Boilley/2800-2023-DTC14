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
    // CHANGE AUTHENTICATED CONDITION WHEN IMPLEMENTATION IS DONE
    const averageCaloriesCursor = await foodCollection.aggregate([{
    $group: {
      _id: null,
      averageCalories: { $avg: "$calories" }
      }
    }]);
  
    const [averageCaloriesDoc] = await averageCaloriesCursor.toArray();
    const averageCalories = averageCaloriesDoc.averageCalories;
    console.log(averageCalories);
    const result = await foodCollection.find({ calories: { $lt: averageCalories }});

    res.render('recommendation.ejs', { authenticated: true, food: result });
    }
);




module.exports = app;