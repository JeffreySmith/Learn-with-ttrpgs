const express = require('express');
const router = express.Router();
const {findUserSafe,rateUser,getUsers,getUserById,getRatings} = require('./user.js');
const {getGroups,findGroup,getGroupById,getGroupMembers, isInGroup} = require('./groups.js');

const {createSession,deleteSession,findSession,allGroupSessions,groupSessionLevels, getGradeLevel,allRPGS} = require('./session.js');



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
    
    let username = req.session.username;
    if(req.params.id){
      groupid = req.params.id;
    }
    if(req.session.username==undefined){
      //username = "ttrpglearning@gmail.com";
      req.session.previousPage=`/group/${req.params.id}/`;
      return res.redirect("/login");
    }
   
    console.log(req.body.username);
    
    if (groupid){
      let group = getGroupById(groupid);
      let sessionLevels = groupSessionLevels(groupid);
      if(group){
	let members = getGroupMembers(group.name);
	let admin = getUserById(group.owner);
	console.log("Admin:");
	console.log(admin);
	console.log(members);
	console.log(group);
	res.render("leavegroup",{members:members,group:group,username:username,sessioninfo:sessionLevels,admin:admin,id:req.params.id});
      }
      else{
	res.redirect("/group");
      }
    }
    else{
      res.redirect("/group");
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
  .get("/userprofile/:id/",(req,res)=>{
    let user = getUserById(req.params.id);
    
    if(user){
      let ratings = getRatings(user.email);
      if(req.session.username){
	let loggedIn = findUserSafe(req.session.username);
	if(loggedIn != user){
	  res.render("publicprofile",{user:user,ratings:ratings,loggedInUser:loggedIn});
	}
	else{
	  res.render("publicprofile",{user:user,ratings:ratings});
	}
      }
      else{
	res.render("publicprofile",{user:user,ratings:ratings});
      }
    }
    else{
      res.redirect("/userprofile");
    }
  })
  .get("/userprofile",(req,res)=>{
    if(req.session.username){
      console.log(getRatings(req.session.username));
      let user = getUsers().find((user)=> user.email === req.session.username);
      res.render("publicprofile",{user:user});
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
  .get("/sessioninfo/:groupid/",(req,res)=>{
    console.log("Trying to get resource...");
    res.set('Access-Control-Allow-Origin', '*');
    let sessions = allGroupSessions(req.params.groupid);
    console.log(sessions);
    let sessionInfo = [];
    for(let session of sessions){
      if(session.transcript){
	let info = {
	  id:session.id,
	  level:getGradeLevel(session.id),
	  time:session.time.substring(0,10).replaceAll("-","/")
	}
	sessionInfo.push(info);
      }
    }
    res.json(sessionInfo);
    
  })
  .get("/sessioninfo",(req,res)=>{
    res.status(401).send("Bad request");
  })
  .get("/groups",(req,res)=>{
    const groups = getGroups();
    res.render("groups",{groups:groups});
  })
  .get("/createsession/:sessionid?/",(req,res)=>{
    const groups = getGroups();
    const rpgs = allRPGS();

    if(!req.params.sessionid){
      res.render("createSessions",{groups:groups,rpgs:rpgs});
    }
    else{
      const session = findSession(req.params.sessionid);

      if(!session){
	return res.redirect("/group");
      }
      
      res.render("createSessions",{groups:groups,rpgs:rpgs,session:session});
    }
  })
  .get("/sessions/:groupid/",(req,res)=>{
    let sessions = allGroupSessions(req.params.groupid);
    let group = getGroupById(req.params.groupid);
    let name = "";
    if(typeof(name) != undefined){
      name = group.name;
    }
    console.log(`Name: ${name}`);
    for (let session of sessions){
      session.date = session.time.substring(0,9);
      session.onlyTime = session.time.substring(11,16);
      
    }
    
    console.log(sessions);
    if (sessions.length===0){
      res.redirect(`/group/${req.params.groupid}`);
    }
    else{
      console.log(sessions);
      res.render("sessionsPage",{sessions:sessions,name:name});
    }
      
  })
  .get("/deletesession/:groupid/:sessionid/",(req,res)=>{
    let user = findUserSafe(req.session.username);
    let group = getGroupById(req.params.groupid);
    //Basically, you have to be logged in as well as a member of the group to delete something
    if(user && isInGroup(user.email,group.groupName)){      
      deleteSession(req.params.sessionid);
      console.log("Session deleted!");
      res.redirect(`/sessions/${req.params.groupid}`);
    }
    else{
      res.redirect(`/sessions/${req.params.groupid}`);
    }
    
  })
  .get("/sendmessage",(req,res)=>{
    if(req.session.username){
      let user = findUserSafe(req.session.username);
      let users = getUsers();
      res.render("message",{user:user,users:users});
    }
    else{
      req.session.previousPage="/sendmessage";
      res.redirect("/login");
    }
  })


module.exports = router;
