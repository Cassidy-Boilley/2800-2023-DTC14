const mongoose = require('mongoose');
const historyItemSchema = new mongoose.Schema({
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
    salad: String
});
const historyItemModel = mongoose.model('historyItem', historyItemSchema);

module.exports = historyItemModel;