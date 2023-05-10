const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/history', async (req, res) => {
    const result = await orderHistoryModel.find({});
    res.render('history.ejs', {historyItems: result, authenticated: req.session.GLOBAL_AUTHENTICATED});
});