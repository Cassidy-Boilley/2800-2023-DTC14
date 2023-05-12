const mongoose = require('mongoose');
const databaseSchema = new mongoose.Schema({
    restaurant: String,
    item: String,
    calories: Number,
    cal_fat: Number,
    total_fat: Number,
    sat_fat: Number,
    trans_fat: Number,
    cholesterol: Number,
    sodium: Number,
    total_carb: Number,
    fiber: Number,
    sugar: Number,
    protein: Number,
    vit_a: Number,
    vit_c: Number,
    calcium: Number,
    salad: String,
    vegan: String,
},
    { collection: 'fastfood' });

const databaseModel = mongoose.model('fastfood', databaseSchema);

module.exports = databaseModel;