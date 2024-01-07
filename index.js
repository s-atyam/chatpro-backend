// importing different modules
const express = require('express');
require('dotenv').config();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
// const { writeFile } = require('fs')
const os = require('os');
const user = require('./src/db/schema/user')
const msg = require('./src/db/schema/message');
const connectDB = require('./src/db/config/db.config');

// port value
const PORT = 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// connecting to database
connectDB();

app.use(express.json());
app.use(cors())

app.use('/auth',require('./src/routes/userauth'))
app.use('/profile',require('./src/routes/userprofile'))

// for storing socket id and mapping user id and vice versa
const soc_user_id = new Map();
const user_soc_id = new Map();

// different socket intances

// this 'connection' intance is when a user is connected to server via socket intance
io.on('connection', async (socket)=>{
    // getting userid from the user when login by the user
    const customSocketId = socket.handshake.query.userid;
    console.log(`connection from client with id : ${socket.id} and cus id `,customSocketId );
    
    soc_user_id.set(socket.id,customSocketId);
    user_soc_id.set(customSocketId,socket.id);
  
    // when user is connected then updating its status 
    await user.findByIdAndUpdate(customSocketId,{"status":true})
    
    // when the current user gets online/connected to server then sending this status to all his friends
    const userData = await user.findById(customSocketId);
    let socketIDArray = []
    const promises = userData.friends.map((element)=>{
        if(user_soc_id.has(element)){
            socketIDArray.push(user_soc_id.get(element));
        }
    })
    await Promise.all(promises);
    socket.to(socketIDArray).emit('status_on_conn',customSocketId);

    // this sokcet instance is when user start typing
    socket.on('sTyping', async (userID)=>{
        try {
            if(user_soc_id.has(userID)){
                const sockID = user_soc_id.get(userID);
                socket.to(sockID).emit('typingS');
            }
        } catch (error) {
            console.log(error.message);
        }
    })
    // this sokcet instance is when user stop typing
    socket.on('eTyping', async (userID)=>{
        try {
            if(user_soc_id.has(userID)){
                const sockID = user_soc_id.get(userID);
                socket.to(sockID).emit('typingE');
            }
        } catch (error) {
            console.log(error.message);
        }
    })
    

    // this socket instance is for when user is sending message
    socket.on('send_message', async (text_data,userID,isFriend,isFile)=>{
        try{
            let status = false;
            if(user_soc_id.has(userID)){
                const sockID = user_soc_id.get(userID);
                socket.to(sockID).emit('recv-message',text_data,isFile);
                status = true;
            }
            if(!isFile){
                const newMsg = new msg({"senderID":customSocketId,"reciverID":userID,"messages":text_data,"status":status});
                newMsg.save();
                if(!isFriend){
                    await user.findByIdAndUpdate(customSocketId,{ $push: { "friends": userID }})
                }
            }
            // else{
            //     writeFile("/home/user/temp.jpg", text_data, (err) => {
            //         if(err){
            //           console.log("error: ",err.message)
            //         }
            //       });
            // }
        }catch(e){
            console.log("Error: ",e.message)
        }
    })
    // this intance is when the user call
    socket.on("callUser", (data) => {
        try{
            if(user_soc_id.has(data.userid)){
                const sockID = user_soc_id.get(data.userid);
                socket.to(sockID).emit('callUser',{ signal: data.signalData, name: data.name});
            }
        }catch(e){
            console.log(e.message)
        }
	})
    
    // this intance is when the user answers the call
	socket.on("answerCall", (data) => {
        try{
            if(user_soc_id.has(data.userid)){
                const sockID = user_soc_id.get(data.userid);
                socket.to(sockID).emit('callAccepted',data.signal);
            }
        }catch(e){
            console.log(e.message)
        }
	})

    // this instance to send updated status of the user to his friends
    socket.on('dis_status', async ()=>{
        try{
            socketIDArray = []
            const promises = userData.friends.map((element)=>{
                if(user_soc_id.has(element)){
                    socketIDArray.push(user_soc_id.get(element));
                }
            })
            await Promise.all(promises);
            socket.to(socketIDArray).emit('status_on_dis',customSocketId);
        }catch(e){
            console.log("Error: ",e.message)
        }
    })

    // this instance when the user logged out or disconnected from the user
    socket.on("disconnect", async () => {
        // TODO : disconnecting status
        console.log("User Disconnected with id : ",socket.id);
        try{
            soc_user_id.delete(socket.id);
            user_soc_id.delete(customSocketId);
            await user.findByIdAndUpdate(customSocketId,{"status":false,"lastModified":Date.now()});
        }catch(e){
            console.log("Error: ",e.message);
        }
    });


})

server.listen(PORT,(e)=>{
    if(e){
        console.log("Server error: ",e);
    }else{
        console.log(`Server Listening on ${PORT}`)
    }
})  