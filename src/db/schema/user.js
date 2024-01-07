const mongoose = require('mongoose')
const { Schema } = mongoose;

// this schema is for user 
const userSchema = new Schema({
    fName : {
        type:String,
        required:true
    },
    lName : String,
    username : {
        type:String,
        require:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    createdAt : {
        type:Date,
        default:Date.now
    },
    lastModified : {
        type:Date,
        default:Date.now
    },
    friends : [mongoose.Schema.Types.ObjectId],
    pass : {
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
})

userSchema.index({username:'text'})

module.exports = mongoose.model('user',userSchema);