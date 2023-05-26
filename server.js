const mongoose = require('mongoose');

// Main page
const app = require('./index.js');


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

function send_mail(name, recipient) {
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
    from: `Admin <${process.env.OAUTH_USER}>`,
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

function get_html_message(name) {
  return `
  <h1> Hi ${name}, </h1>
  <p> You recently requested to reset your password for your ChatBLT account. Click the button below to reset it. </p>
  <a href="https://odd-blue-bull-hem.cyclic.app/password-reset"> Reset password </a>
  <p> If you did not request a password reset, please ignore this email. </p>
  <p> Thanks, </p>
  <p> The ChatBLT Team </p>
  `
}

send_mail('Test', process.env.OAUTH_USER)

// Other pages
const mealPlan = require('./meal-plan.js');
const recommendations = require('./recommendations.js');
app.use('/', mealPlan);
app.use('/', recommendations);
main().catch(err => console.log(err));

async function main() {

  await mongoose.connect(process.env.MDBCONNECTION_STRING);
  console.log("connected to db");
  app.listen(3040, () => {
    console.log('server is running on port 3040');
  });
}