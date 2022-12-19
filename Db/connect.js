
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.set('strictQuery', true);

let Link = process.env.MONGO_URL

mongoose.connect(`${Link}`).then(() => {
    console.log("DB Connected Done");
}).catch((error) => {
    console.log(error);
})