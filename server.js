// TODO: Setup the environment variables
const mongoose = require('mongoose');
const app = require('./app.js');
const dotenv = require('dotenv');
dotenv.config();

// Main function needs to be called after inputting environment variables
main().catch(err => console.log(err));

async function main() {
    // TODO: connect to the atlas cluster
    await mongoose.connect('mongodb://127.0.0.1:27017');
    console.log("connected to db");
    app.listen(process.env.PORT || 3000, () => {
        console.log('Server is running!')
    })
}