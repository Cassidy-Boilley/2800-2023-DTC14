const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get("/meal-plan", (req, res) => {
    res.render("meal_plan.ejs", {
    });
});

module.exports = app;