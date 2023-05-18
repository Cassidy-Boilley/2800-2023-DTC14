const express = require('express');
const app = express();
const historyItemModel = require('./models/historyItem');

app.set('view engine', 'ejs');
app.use(express.static('public'));

// TODO: Create something that will save to history
// For now, creating a history item will be done manually

app.get('/history', async (req, res) => {
    const result = await historyItemModel.find({});
    // TODO: Temporary authentication code, update later
    res.render('history.ejs', {historyItemList: result, authenticated: true});
});

module.exports = app;