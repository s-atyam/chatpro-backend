const mongoose = require('mongoose')
const mongoURL = process.env.MONGO_URI

// this function is for connecting to the database
const connectDB = async () =>{
    try{
        // console.log(mongoURL)
        await mongoose.connect(mongoURL,{dbName:'chatpro'});
        console.log("Connected to Database ChatPro(MongoDB)")
    }catch(e){
        console.log(e.message);
    }
}

module.exports = connectDB;