//Require
const mongoose = require('mongoose');

//Schema
const User = new mongoose.Schema({
    name :{
        type: String,
        required: true,
        collection: String
    },
    email :{
        type: String,
        required: true,
        
    },
    password:{
        type: String,
        required : true
    },
    confirmPassword:{
       type: String
    },
    isActive:{
        type: String,
        default :'inActive'
    },
    randomString:{
        randomString: String,
        
    }

},{timestamps : true})

//Export;
module.exports = mongoose.model("Users_data", User);