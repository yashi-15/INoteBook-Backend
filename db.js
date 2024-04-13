const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1/inotebook?directConnection=true"

async function connectToMongo() {
    await mongoose.connect(mongoURI).then(()=> console.log("Connected to Mongo Successfully")).catch(err => console.log(err));
  }
  
  module.exports = connectToMongo;
