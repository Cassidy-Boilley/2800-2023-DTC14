const mongoose = require('mongoose');

// Main page
const app = require('./index.js');


// dotenv setup
const dotenv = require('dotenv');
dotenv.config();

// Other pages
const mealPlan = require('./meal-plan.js');
const recommendations = require('./recommendations.js');
app.use('/', mealPlan);
main().catch(err => console.log(err));

async function main() {

  await mongoose.connect(process.env.MDBCONNECTION_STRING);
  console.log("connected to db");
  app.listen(3040, () => {
    console.log('server is running on port 3040');
  });
}