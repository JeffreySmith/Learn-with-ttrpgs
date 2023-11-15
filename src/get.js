const express = require('express');
const router = express.Router();
const {insertUser,findUserSafe,rateUser,getUsers,getUserById} = require('./user.js');
const {getGroups,joinGroup,insertGroup,findGroup,deleteGroup,getGroupById,getGroupMembers} = require('./groups.js');
const {sendPasswordResetEmail} = require('./email.js');
const {createSession,findSession,allGroupSessions,groupSessionLevels} = require('./session.js');
const bcrypt = require('bcrypt');


const db = require('better-sqlite3')(global.db_string);
db.pragma('foreign_keys=ON');

router
  .get('/hi',(req,res)=>{
    res.send("Hi there!");
  })
  .get('/',(req,res)=>{
    res.render("home");
  })
  .get('/check',(req,res)=>{
    if(req.session.username){
      res.send(`You're logged in as ${req.session.username}`);
    }
    else{
      res.send('Please log in');
    }
  })
  .get('/register',(req,res)=>{
    res.render("registration");
  })
  .get('/login',(req,res)=>{
    res.render("login");
  })
  .get('/recovery',(req,res)=>{
    res.render("recovery");
  })
  .get("/recover/:id/",(req,res)=>{
    let id = req.params.id;
    let validRequest = global.resetUUIDS.find(u=>u.uuid === id);
    let index = undefined;
    let user = findUserSafe(validRequest.email);
    if(validRequest){
      index = global.resetUUIDS.findIndex(u=>u.uuid === id);
    }
    else{
      res.status(400).send("Invalid link");
    }
    console.log(validRequest);
    console.log("Index is: "+index);
    if(validRequest && Date.now()-validRequest.time <= 900000){
      console.log("Allow password resetting");
      console.log(Date.now() - validRequest.time);
      //global.resetUUIDS = global.resetUUIDS.filter(u=>u.uuid !== id);
      res.render("newpassword",{user:user});
    }
    else{
      console.log("Password reset not valid");
      global.resetUUIDS = global.resetUUIDS.filter(u=>u.uuid !== id);
      res.status(401).send("Link not valid");
    }
  
  })
  
  .get("/group/:id/",(req,res)=>{
    let groupid = undefined;
    let groups = getGroups();
    let username = req.session.username;
    if(req.params.id){
      groupid = req.params.id;
    }
    if(req.session.username==undefined){
      //username = "ttrpglearning@gmail.com";
      return res.redirect("/login");
    }
   
    console.log(req.body.username);
    let user = findUserSafe(username);

    if (groupid){
      let group = getGroupById(groupid);
      let sessionLevels = groupSessionLevels(groupid);
     /* if(user.id === group.owner){
	//Show group admin version?
      }
      else{*/
	//Show the regular group member page
	let members = getGroupMembers(group.name);
	let admin = getUserById(group.owner);
	console.log("Admin:");
	console.log(admin);
	console.log(members);
	console.log(group);
	res.render("leavegroup",{members:members,group:group,username:username,sessioninfo:sessionLevels,admin:admin,id:req.params.id});
      //}
    }
    else{
      res.render("joincreate",{groups:groups,username:username});
    }
  })
  .get("/group",(req,res)=>{
    let groups = getGroups();
    if (req.session.username){
      let username = req.session.username;
      res.render("joincreate",{groups:groups,username:username});
    }
    else{
      res.redirect("/login");
    }
  })
  .get("/userpage",(req,res)=>{
    if(req.session.loggedIn){
      let user = getUsers().find((user)=> user.email === req.session.username);
      res.render("userpage",{user:user});
    }
    else{
      res.redirect("/login");
    }
  })
  .get("/session/:id/",(req,res)=>{
    let id = req.params.id;
    
    let session = findSession(id);
    let groups = getGroups();
    
    session.time = session.time.slice(0,session.time.length-3);
    
    if(session != undefined){
      res.render("sessionpage",{session:session,groups:groups});
    }
    else{
      //This should be changed to return an error? Or redirect back to where they came from?
      res.render("sessionpage",{groups:groups});
    }
  })


module.exports = router;
