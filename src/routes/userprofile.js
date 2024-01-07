const express = require('express')
const router = express.Router();

const fetchuser = require('../middleware/fetchUser')
const user = require('../db/schema/user')

// this route is for user data from the database, given the auth token 
router.get('/getUserData',fetchuser, async (req,res)=>{
    try{
        const data = await user.findOne({_id:req.userID}).select('-pass');
        res.send(data);
    }catch(e){
        console.log("Error : ",e.message);
    }
})

// this route is for searching the user in the database, given the username or initials 
router.get('/search', async (req,res)=>{
    try{
        const searchPattern = new RegExp(req.headers.username, 'i');
        const data = (await user.find({ username: { $regex: searchPattern }})).filter(u=>u._id!=req.headers.userid);        
        res.send({data});
    }catch(e){
        console.log("Error : ",e.message);
    }
})

// this route is for getting all the friends of the given userID 
router.get('/searchFr', async (req,res)=>{
    try{
        const data = [];
        let searchedUser = await user.findById(req.headers.userid)
        const promises = searchedUser.friends.map(async (element) => {
            let searchedUser = await user.findById(element);
            data.push(searchedUser);
        });
        await Promise.all(promises);
        res.send({"data":JSON.stringify(data)});
    }catch(e){
        console.log("Error : ",e.message);
    }
})

// this route is to get the chat history of all the friends of the given userID
router.get('/chathistory', async (req,res)=>{e})
    // TODO : complete this route
module.exports = router;