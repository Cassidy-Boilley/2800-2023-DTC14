const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const usersModel = require('./models/users');
const app = express();
const Joi = require('joi');
const dotenv = require('dotenv');
dotenv.config();
var MongoDBStore = require('connect-mongodb-session')(session);
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

var dbStore = new MongoDBStore({
    uri: process.env.MDBCONNECTION_STRING,
    collection: 'sessions'
});

app.use(session({
    secret: process.env.MDBCONNECTION_STRING,
    store: dbStore,
    resave: false,
    saveUninitialized: false,
    expires: new Date(Date.now() + 3600000)
}));

app.get('/', async (req, res) => {
    const result = await usersModel.findOne({
        email: req.session.loggedEmail
    })
    
    let name = ""
    let welcomeMessage = ""
    if (result !== null) {
        name = result.name;
        if (name.toLowerCase() === 'chris') {
            name = 'PythonLover3000';
        }
        const welcome = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: "Reword the following paragraph in 10 words:\n" + "we are so glad to see you again," + name + "!",
            max_tokens: 150
        });
        welcomeMessage = welcome.data.choices[0].text
        // res.render('index.ejs', { authenticated: req.session.GLOBAL_AUTHENTICATED, name: name });
    // } else {
        // res.render('index.ejs', { authenticated: req.session.GLOBAL_AUTHENTICATED, name: "" });
    }

    const introduction = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Reword the following paragraph:\n" + "Welcome to the app that remembers your fast food history and gives you new meals to try!",
        max_tokens: 150    
    });

    res.render('index.ejs', { authenticated: req.session.GLOBAL_AUTHENTICATED, name: name, intro: introduction.data.choices[0].text, welcomeMessage: welcomeMessage })
}
);

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following:
 * - Add field city to user model
 * - Remove type from user model
 * - Update <a> tags to use bootstrap styling
 */
app.post('/signup', async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().regex(/^[\w\-\s]+$/).max(20).required(),
            email: Joi.string().email().required(),
            password: Joi.string().max(20).required()
        });
        console.log(req)
        await schema.validateAsync({ name: req.body.name, email: req.body.email, password: req.body.password });
    } catch (err) {
        res.send(`
        <h1> ${err.details[0].message} </h1>
        <a class='btn btn-primary' href='/signup'> Try again. </a>
        `);
        return;
    };
    try {
        const result = await usersModel.findOne({
            email: req.body.email
        })
        if (result === null && req.body.name && req.body.email && req.body.password) {
            const newUserPassword = bcrypt.hashSync(req.body.password, 10);
            const newUser = new usersModel({
                name: req.body.name,
                email: req.body.email,
                password: newUserPassword,
                city: "",
                resetToken: undefined,
                resetTokenExpiration: undefined
            });
            await newUser.save();
            res.redirect('/login');
        } else {
            res.send(`
            <h1> Email already exists. </h1>
            <a class='btn btn-primary' href='/signup'> Try again. </a>
            `)
        }
    } catch (err) {
        console.log(err);
        res.send(`
        <p> Error signing up </p>
        `);
    }
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following:
 * - Remove console.log message with password
 * - Remove assignment of schema validation to a variable
 * - Update redirect link on login success
 * - Update <a> tags to use bootstrap styling
 * - Removed loggedType from session
 */
app.post('/login', async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().max(20).required()
        });
        await schema.validateAsync({ email: req.body.email, password: req.body.password });
    } catch (err) {
        console.log(err);
        res.send(`
        <h1> ${err.details[0].message} </h1>
        <a class='btn btn-primary' href='/login'> Try again. </a>
        `)
        return;
    };
    try {
        // set a global variable to true if the user is authenticated
        const result = await usersModel.findOne({
            email: req.body.email
        })
        console.log(result)
        if (result === null) {
            res.send(`
            <h1> Invalid email/password combination. </h1>
            <a class='btn btn-primary' href='/login'> Try again. </a>
            `);
        } else if (bcrypt.compareSync(req.body.password, result?.password)) {
            req.session.GLOBAL_AUTHENTICATED = true;
            req.session.loggedName = result.name;
            req.session.loggedEmail = req.body.email;
            req.session.loggedPassword = req.body.password;
            var hour = 3600000;
            req.session.cookie.expires = new Date(Date.now() + (hour));
            req.session.cookie.maxAge = hour;
            res.redirect('/');
        } else {
            res.send(`
            <h1> Invalid email/password combination. </h1>
            <a class='btn btn-primary' href='/login'> Try again. </a>
            `);
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.post("/sendPrompt", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/accountsettings", async (req, res) => {
    if (req.session.GLOBAL_AUTHENTICATED) {
        const user = await usersModel.findOne({
            name: req.session.loggedName
        });
        res.render('accountsettings.ejs', { user: user, name: user.name });
    } else {
        res.redirect("/login");
    }
});

app.get("/chat", async (req, res) => {
    const user = await usersModel.findOne({
        name: req.session.loggedName
    });
    
    async function runCompletion() {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: "How are you today?",
        });
        res.render('chat.ejs', { message: completion.data.choices[0].text, user: user.name, name: user.name });
    }
    runCompletion();
});

app.post("/update-profile", async (req, res) => {
    const profileInfo = req.body;
    console.log(profileInfo);

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().max(20).required(),
            city: Joi.string().required()
        });
        await schema.validateAsync({ 
            name: profileInfo.name, 
            email: profileInfo.email, 
            password: profileInfo.password, 
            city: profileInfo.city 
        });
    } catch (err) {
        console.log(err);
        res.send(`
        <h1> ${err.details[0].message} </h1>
        <a class='btn btn-primary' href='/accountsettings'> Try again. </a>
        `)
        return;
    };

    try {
        const result = await usersModel.updateOne(
            { name: req.session.loggedName },
            {
                $set: {
                    city: profileInfo.city,
                    email: profileInfo.email,
                    name: profileInfo.name
                }
            }
        );
        res.redirect("/accountsettings");
    } catch (error) {
        res.send("An error happened, please try again");
    }
});



module.exports = app;