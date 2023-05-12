const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const usersModel = require('./models/users');
const app = express();
const Joi = require('joi');
const dotenv = require('dotenv');
dotenv.config();
var MongoDBStore = require('connect-mongodb-session')(session);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following: TODO: update modifications
 */
var dbStore = new MongoDBStore({
    uri: process.env.MDBCONNECTION_STRING,
    collection: 'sessions'
});

/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following: TODO: update modifications
 */
app.use(session({
    secret: process.env.MDBCONNECTION_STRING,
    store: dbStore,
    resave: false,
    saveUninitialized: false,
    expires: new Date(Date.now() + 3600000)
}));

app.get('/', (req, res) => {
    // TODO: CHANGE AUTHENTICATED CONDITION WHEN IMPLEMENTATION IS DONE
    res.render('index.ejs', { authenticated: req.session.GLOBAL_AUTHENTICATED });
}
);

/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following: TODO: update modifications
 * - Removed a field from the user model
 */
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following: TODO: update modifications
 * - Removed a field from the user model
 * - Remove assignment of schema validation to a variable
 * - TODO: change a href to button in error message
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
        <a href='/signup'> Try again. </a>
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
                city: ""
            });
            await newUser.save();
            res.redirect('/login');
        } else {
            res.send(`
            <h1> Email already exists. </h1>
            <a href='/signup'> Try again. </a>
            `)
        }
    } catch (err) {
        console.log(err);
        res.send(`
        <p> Error signing up </p>
        `);
    }
});

/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following: TODO: update modifications
 */
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

/**
 * The following block of code is from a COMP2537 assignment, with some modifications.
 * The modifications include the following: TODO: update modifications
 * - Remove console.log message with password
 * - Remove assignment of schema validation to a variable
 * - Update redirect link on login success
 * - TODO: change a href to button in error message
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
        <a href='/login'> Try again. </a>
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
            <a href='/login'> Try again. </a>
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
            <a href='/login'> Try again. </a>
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

app.get("/password-recovery", (req, res) => {
    res.render('password-recovery.ejs');
});

app.post("/password-recovery", async (req, res) => {
    const inputEmail = req.body;

    const result = await usersModel.findOne({
        email: inputEmail.email
    });

    if (inputEmail.email === result?.email) {
        res.redirect("/password-reset");
    } else {
        res.send(`
        <h1> Invalid email. </h1>
        <a href='/password-recovery'> Try again. </a>
        `);
    }
});

app.get("/password-reset", (req, res) => {
    res.render('password-reset.ejs');
});

app.post("/password-reset", async (req, res) => {
    const inputEmail = req.body;
    const inputPassword = req.body;
    const hashedPassword = await bcrypt.hash(inputPassword.password, 10);

    console.log(inputEmail);
    console.log(inputPassword.password);

    try {
        const result = await usersModel.updateOne(
            { email: inputEmail.email },
            { $set: { password: hashedPassword } }
        );
        res.redirect("/login");
    } catch (error) {
        res.send("An error happened, please try again");
    }
});

app.get("/accountsettings", async (req, res) => {
    const user = await usersModel.findOne({
        name: req.session.loggedName
    });
    console.log(user);
    res.render('accountsettings.ejs', { user: user });
});

app.post("/update-profile", async (req, res) => {
    const profileInfo = req.body;
    console.log(profileInfo);

    try {
        const result = await usersModel.updateOne(
            { name: req.session.loggedName },
            { $set: { 
                city: profileInfo.city, 
                email: profileInfo.email, 
                name: profileInfo.name } }
        );
        res.redirect("/accountsettings");
    } catch (error) {
        res.send("An error happened, please try again");
    }
});

module.exports = app;