const mongoose = require('mongoose')
const { Schema } = mongoose;

// this schema is for message
const chats = new Schema({
    senderID : mongoose.Schema.Types.ObjectId,
    reciverID : mongoose.Schema.Types.ObjectId,
    messages : String,
    createdAt : {
        type:Date,
        default:Date.now()
    },
    status : {
        type:Boolean,
        default:false
    }
})

chats.index({createdAt:1})

module.exports = mongoose.model('chat',chats);