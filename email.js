// Variable setup
const express = require('express');
const app = express();

// dotenv setup
const dotenv = require('dotenv');
const { get } = require('http');
dotenv.config();

// OAuth setup
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET);
OAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });

// Emailing function

function send_password_reset_mail(name, recipient) {
    const accessToken = OAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.OAUTH_USER,
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
            accessToken: accessToken
        }
    })

    const mail_options = {
        from: `ChatBLT Admin <${process.env.OAUTH_USER}>`,
        to: recipient,
        subject: 'Request to reset your ChatBLT password',
        html: get_html_message()
    }

    transport.sendMail(mail_options, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
        transport.close();
    })
}

function get_html_message() {
    return `
    <h1> Hey there, </h1>
    <p> You recently requested to reset your password for your ChatBLT account. Click the button below to reset it. </p>
    <a href="https://odd-blue-bull-hem.cyclic.app/password-reset"> Reset password </a>
    <p> If you did not request a password reset, please ignore this email. </p>
    <p> Thanks, </p>
    <p> The ChatBLT Team </p>
    `
}

// Routes



send_password_reset_mail('Test', process.env.OAUTH_USER)

module.exports = app;