const express = require('express');
const mongoose = require('mongoose');
const app = require('./meal-plan.js');
const dotenv = require('dotenv');
require('dotenv').config();

main().catch(err => console.log(err));

async function main() {

  await mongoose.connect(`mongodb+srv://cboilley:${process.env.MDBPASSWORD}@dtc14.e61wbsk.mongodb.net/?retryWrites=true&w=majority`);

  console.log("connected to db");
  app.listen(process.env.PORT || 3040, () => {
    console.log('server is running on port 3020');
  });
}