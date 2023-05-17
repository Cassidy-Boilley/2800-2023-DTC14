const express = require('express');
const app = express();
const historyItemModel = require('./models/historyItem');

const dotenv = require('dotenv');
dotenv.config();

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.set('view engine', 'ejs');
app.use(express.static('public'));

// TODO: Create something that will save to history
// For now, creating a history item will be done manually

app.get('/history', async (req, res) => {
    const result = await historyItemModel.find({});

    
    // TODO: Temporary authentication code, update later
    const startPrompt = "Write a paragraph of less than 120 words which greets a user named Bob, tells him that" +
        "the following list is his history of meals, and summarizes the list"

    async function runCompletion() {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: startPrompt + result,
            max_tokens: 150
        });
        console.log(completion.data.choices[0].text)
        res.render('history.ejs', { authenticated: true, historyItemList: result, message: completion.data.choices[0].text });
    }
    runCompletion();
    // res.render('history.ejs', {historyItemList: result, authenticated: true});
});

module.exports = app;