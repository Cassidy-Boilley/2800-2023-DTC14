const express = require('express');
const mongoose = require('mongoose');
const app = require('./index.js');

main().catch(err => console.log(err));

async function main() {
  console.log("connected to db");
  app.listen(3040, () => {
    console.log('server is running on port 3040');
  });
}