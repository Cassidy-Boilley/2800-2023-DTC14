const mongoose = require('mongoose');
const app = require('./index.js');
const dotenv = require('dotenv')
dotenv.config();

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(`${process.env.MDBCONNECTION_STRING}`);
  console.log("connected to db");
  app.listen(3040, () => {
    console.log('server is running on port 3040');
  });
}