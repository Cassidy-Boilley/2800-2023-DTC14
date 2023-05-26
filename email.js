// Variable setup
const express = require('express');
const app = express();
const usersModel = require('./models/users');
const Joi = require('joi');

// dotenv setup
const dotenv = require('dotenv');
const { get } = require('http');
dotenv.config();

// Crypto setup
const crypto = require('crypto');

// OAuth setup
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET);
OAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });

// Routes
app.get("/password-reset", (req, res) => {
    console.log("Password reset page")
    res.render('password-reset.ejs');
});

app.post("/password-reset", async (req, res) => {
    const { email } = req.body;

    const schema = Joi.object({
        email: Joi.string().email().required(),
    });

    try {
        await schema.validateAsync({ email });
    } catch (err) {
        res.send(`
      <h1>${err.details[0].message}</h1>
      <a class='btn btn-primary' href='/password-reset'>Try again.</a>
    `);
        return;
    }

    const user = await usersModel.findOne({ email });

    if (user) {
        const randomString = crypto.randomBytes(20).toString("hex");
        const resetToken = crypto
            .createHash("sha256")
            .update(randomString)
            .digest("hex");
        const resetTokenExpiration = Date.now() + 10 * 60 * 1000;

        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();

        const accessToken = OAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.OAUTH_USER,
                clientId: process.env.OAUTH_CLIENT_ID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        function getHtmlMessage() {
            return `
                <h1> Hey there, </h1>
                <p> You recently requested to reset your password for your ChatBLT account. Click the button below to reset it. </p>
                <a href="https://odd-blue-bull-hem.cyclic.app/password-reset/${resetToken}"> Reset password </a>
                <p> If you did not request a password reset, please ignore this email. </p>
                <p> Thanks, </p>
                <p> The ChatBLT Team </p>
            `;
        }

        const mailOptions = {
            from: `ChatBLT Admin <${process.env.OAUTH_USER}>`,
            to: email,
            subject: "Request to reset your ChatBLT password",
            html: getHtmlMessage(),
        };

        transport.sendMail(mailOptions, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
            transport.close();
        });

        res.send(`
        <h1>Password reset email sent. Check your inbox.</h1>
        <a class='btn btn-primary' href='/'> Home </a>
        `);
    } else {
        res.send(`
        <h1>Email not found.</h1>
        <a class='btn btn-primary' href='/password-reset'>Try again.</a>
        `);
    }
});

app.get("/password-reset/:token", (req, res) => {
    const token = req.params.token;
    res.render("password-reset-form.ejs", { token });
});

app.post("/password-reset/:token", async (req, res) => {
    const token = req.params.token;
    const { password } = req.body;

    const schema = Joi.object({
        password: Joi.string().max(20).required(),
    });

    try {
        await schema.validateAsync({ password });
    } catch (err) {
        res.send(`
      <h1>${err.details[0].message}</h1>
      <a class='btn btn-primary' href='/password-reset/${token}'>Try again.</a>
    `);
        return;
    }

    const user = await usersModel.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    });

    if (user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        res.send(`
        <h1>Password reset successful.</h1>
        <a class='btn btn-primary' href='/login'>Login</a>
        `);
    } else {
        res.send(`
        <h1>Invalid or expired token.</h1>
        <a class='btn btn-primary' href='/password-reset'>Try again.</a>
        `);
    }
});

//send_password_reset_mail('Test', process.env.OAUTH_USER)

app.get("*", async (req, res) => { // A GET action that renders a 404 page if the user tries to access a page that does not exist
    if (req.session.GLOBAL_AUTHENTICATED) {
        const user = await usersModel.findOne({
            email: req.session.loggedEmail
        })
        res.status(404).render('404.ejs', { name: user.name }); // Render 404 page
    } else {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    }
});

module.exports = app;