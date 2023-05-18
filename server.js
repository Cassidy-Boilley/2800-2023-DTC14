const mongoose = require('mongoose');
// TODO: Find out how to use multiple .js files for app
// For now, just update the app constant
const app = require('./index.js');
const dotenv = require('dotenv');
dotenv.config();

// Other pages
const history = require('./history');
app.use('/', history);
const app = require('./meal-plan.js');
app.use('/', mealPlan);
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MDBCONNECTION_STRING);
  console.log("connected to db");
  app.listen(3040, () => {
    console.log('server is running on port 3040');
  });
}