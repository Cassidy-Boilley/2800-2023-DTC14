# 2800-2023-DTC14 - CHATBLT

# PITCH
Our team, DTC-14, is developing an app to help busy people choose fast food meals faster and more efficiently with ChatGPT.

# TECHNOLOGIES USED

## FRONTEND

- Bootstrap: 5.3.0-alpha3
- Fontawesome
- HTML5
- EJS
- CSS

## Backend
 - Javascript
 - Node.js

## Database
 MongoDB, Atlas Cluster

## Hosting
cyclic.sh

# LISTING OF FILE CONTENTS OF FOLDER

C:.
│   .env
│   .gitignore
│   email.js
│   index.js
│   meal-plan.js
│   package-lock.json
│   package.json
│   passwords.txt
│   procfile
│   README.md
│   recommendations.js
│   server.js
│   template.ejs
│
├───models
│       fastfoodCollection.js
│       foodcollection.js
│       mealplan.js
│       mealplanCollection.js
│       users.js
│
├───public
│   ├───css
│   │       basic.css
│   │       dark.css
│   │       index.css
│   │
│   └───images
│           chatBLT.png
│
└───views
    │   404.ejs
    │   accountsettings.ejs
    │   chat.ejs
    │   fast-food.ejs
    │   filter.ejs
    │   index.ejs
    │   login.ejs
    │   meal-plan.ejs
    │   password-reset-form.ejs
    │   password-reset.ejs
    │   recommendations.ejs
    │   signup.ejs
    │
    └───partials
            dark-footer.ejs
            dark-header.ejs
            footer.ejs
            header.ejs

# HOW TO INSTALL/RUN THE PROJECT

## Languages used:
- HTML5
- Javascript
- CSS

## IDE used:
- Visual Studio Code

## Database:
- MongoDB

## Dependencies to install (Inside the root folder):

 bcrypt : 5.1.0
 body-parser: 1.20.2
 connect-mongodb-session : 3.1.1
 dotenv: 16.0.3
 ejs: 3.1.9
 env: 0.0.2
 express: 4.18.2
 express-mongoose: 0.1.0
 express-session: 1.17.3
 googleapis: 118.0.0
 joi: 17.9.2
 mongodb: 5.5.0
 mongoose: 7.2.1
 nodemailer: 6.9.2
 openai: 3.2.1

### To install these, use the command npm i 'dependency name'. ex: npm i bcrypt. PS: The installation order² does not matter

### When using localhost, use the command nodemon server.js

# CREDITS, REFERENCES, LICENSES

## Attributions

The following lines are from [COMP2537 assignment 1](https://github.com/jyoonbcit/comp2537-assignment1/blob/master/app.js): <br>

- index.js: 79 to 123
- index.js: 138 to 182

With the following adjustments made: <br>²

For lines 79 to 123:

- Add field city to user model
- Remove type from user model
- Update <a> tags to use bootstrap styling

For lines 138 to 182:

- Remove console.log message with password
- Remove assignment of schema validation to a variable
- Update redirect link on login success
- Update <a> tags to use bootstrap styling
- Removed loggedType from session

## Our API usage

Our API is the OpenAI API provided by the creators of ChatGPT. This API takes the functionality of ChatGPT of generating text based on user inputted prompts. We used the prompt to generate descriptions for all of the meals. However, this had led us to run out of queries on our free trial which crashed our app due to an error. To overcome this we used another API key from a new account. !!DISCLAIMER!! OpenAI considers two accounts the same if the same email is used or phone number.

## Contact Information

Cassidy Boilley  <cboilley@my.bcit.ca>
Joshua Chuah  <jchuah@my.bcit.ca>
Wilber Lin  <wlin118@my.bcit.ca>
Jihoon Yoon  <jyoon72@my.bcit.ca>
