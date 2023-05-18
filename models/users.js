/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following:
 * - Removed a field from the user model
 */
const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    city: String,
    mealPlan: Array
});
const usersModel = mongoose.model('users', usersSchema);

module.exports = usersModel;