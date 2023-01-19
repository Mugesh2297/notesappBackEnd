//Require;
const mongoose = require('mongoose');

//Schema;
const Notes = new mongoose.Schema({
  title: {
        type: String,
        required: true,
        collection: String
    },
    description: {
        type: String,
        required: true,
        collection: String
    },
   
    userid: {
        type: String,
       
    }
},{timestamps : true});

module.exports = mongoose.model( "Notes", Notes )

