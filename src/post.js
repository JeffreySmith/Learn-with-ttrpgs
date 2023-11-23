const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const {check,query,validationResult} = require( 'express-validator');
const {insertUser,findUserSafe,rateUser,getUsers,getUserById, updateRating} = require('./user.js');
const {getGroups,joinGroup,insertGroup,findGroup,leaveGroup,createGroup, getGroupById, deleteGroupByID} = require('./groups.js');
const {sendPasswordResetEmail, sendMail, sendMessage} = require('./email.js');
const {createSession,findSession,allGroupSessions,addTranscript} = require('./session.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getGroupMembers,changeOwner } = require("./groups.js");
const { groupSessionLevels } = require("./session.js");
const db = require('better-sqlite3')(global.db_string);
db.pragma('foreign_keys=ON');

//This should change eventually, but until then, 6 is fine
//Requires fixing the entries in the test data
const password_len = 6;

router
  .post("/recoverpassword",[check("password","You must supply a password").notEmpty(),check("confirmpassword","You must confirm your password").notEmpty()],(req,res)=>{
    const errors = validationResult(req);
    let localErrors = [];
    let password = req.body.password;
    let confirmpassword = req.body.password;
    let email = req.body.email;
    if(password !== confirmpassword){
      localErrors.push("Your passwords do not match");
    }

    
    if(password.length< password_len){
      localErrors.push(`Your password must be at least ${password_len} characters long`);
    }
    if(errors.length>0 || localErrors.length > 0){
      res.render("newpassword",{errors:errors.array().concat(localErrors)});
    }
    else{
      //Need to figure out how to do this securely
      bcrypt
	.hash(password,10)
	.then(hash=>{
	  
	  let expr = db.prepare("UPDATE Users SET password = ? WHERE email=?");
	  let info = expr.run(hash,email);
	  console.log(info);
	})
	.catch(err=>console.error(err.message));
      
      res.redirect("userpage");
    }
    
  })
//This needs some checking, probably
  .post("/session",(req,res)=>{
    let file = "";
    let time = req.body.time;
    let group = req.body.group;
    let id = "";
    time = time.replace("T"," ")+":00";
    
    if(!req.files || Object.keys(req.files).length === 0){
      console.log("No file");
      id = createSession(group,time);
      //return res.render("sessionpage",{error:"No file uploaded"});
    }
    else{
      file = req.files.transcript;
      const uuid = crypto.randomUUID();
    
      file.mv(`www/files/${uuid}.txt`,err=>{
	if(err){
	  console.log(`Error:${err}`);
	  return res.render("sessionpage",{error:err});
	}
	else{
	  console.log(`File, ${file}, uploaded`);
	}
      });
      id = createSession(group,time,`${uuid}.txt`);
      
    }

    
    
    let groups = getGroups();
    console.log(`ID: ${id.id}`);
    let session = findSession(id.id);
    //console.log(`ID: ${session.id}`);
    console.log(time);
    console.log(group);
    res.render("sessionpage",{session:session,groups:groups});
  })
  .post("/recovery",[check('email',"Please enter a valid email").isEmail()],(req,res)=>{
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
      res.render("recovery");
    }
    else{
      
      let email = req.body.email;
      
      sendPasswordResetEmail(email);
      res.send("A password reset email has been sent FiX THIS LATER");
    }
  })
  .post("/register",[check('name',"Please enter a first name").notEmpty(),check('lastname',"Please enter a last name").notEmpty(),check('email',"Please enter a valid email").isEmail(),check('password',"Please enter a password").notEmpty(),check('confirmPassword',"Please confirm your password").notEmpty()],(req,res)=>{
  
    const errors = validationResult(req);
    console.log(errors);

    let name = req.body.name;
    let lastName = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;
    
    if(password.length < password_len){
      localErrors.push(`Your password must be at least ${password_len} characters long`);
    }
    
    if(!errors.isEmpty()){
      return res.render("registration",{errors:errors.array()});
    }
  
    insertUser(name,lastName,email,password,"user");
    res.redirect("/login");
    //res.render("registration",{message:"User account created!"});
  })
  .post("/login",[
    query('email').isEmail()], (req, res) => {
      const users = getUsers();
      const email = req.body.email;
      const password = req.body.password;
      const user = users.find((user) => user.email === email);
      
      if (!user) {
	console.log("User not found");
	return res.render("login");
      }
      
      bcrypt.compare(password, user.password)
	.then((result) => {
	  if (result) {
            req.session.loggedIn = true;
            req.session.username = user.email;
            req.session.role = "user";
            console.log("User login correct");
            //res.render("login",{message:"You've logged in successfully!"});
	    if(!req.session.previousPage){
	      res.redirect("/userprofile");
	    }
	    else{
	      let previous = req.session.previousPage;
	      req.session.previousPage = undefined;
	      res.redirect(previous);
	      
	    }
	  } else {
            console.log("Password is wrong");
            res.render("login",{message:"Incorrect login info"});

	  }
	})
	.catch((err) => {
	  console.error(`Error with bcrypt: ${err}`);
	  res.render("login");
	});
    })
  .post("/logout",(req,res)=>{
    if(req.session.username){
      console.log(`User ${req.session.username} has been logged out`);
    }
    else{
      console.log("No one is currently logged in");
    }
    req.session.loggedIn = undefined;
    req.session.username = undefined;
    req.session.role = undefined;
    res.render("index");
  })

  .post("/findgroup",(req,res)=>{
    let name = req.body.name;
    //TODO join Groups and Users table
    let owner = req.body.owneremail;
    let groups = getGroups();
    let group = "";
    if(name){
      group = groups.find((group)=> group.name === name);
      console.log(group);
    }
    
  })
/*  .post("/deletegroup",(req,res)=>{
    let groups = getGroups();
    let groupName = req.body.name;
    let group = groups.find((group)=> group.name === groupName);
    if(!group){
      return res.render("group",{message:"No such group exists"});
    }
    deleteGroup(group);
  })*/
  .post("/joingroup",(req,res)=>{
    let groupName = req.body.group;
    if(groupName && req.session.username){
      let group = findGroup(undefined,groupName);
      group = group[0];
      joinGroup(req.session.username,groupName);
      res.redirect(`/group/${group.id}`);
    }
    else{
      res.redirect("/login");
    }
  })
  .post("/group/:id?/",(req,res)=>{
    let id = req.body.id;
    let groupName = req.body.groupname;
    let username = req.body.username;
   
    console.log("Name:"+groupName);
    let group = findGroup(undefined,groupName);
    if(group.length === 1){
      group = group[0];
      console.log(group);
    }
    else{
      console.log("Didn't find any groups that matched...");
    }
    console.log("Owner: "+group.owner);
    
    let admin = getUserById(group.owner);
    //let sessionLevels = groupSessionLevels(group.id);
    console.log("Admin:");
    console.log(admin);
    
    leaveGroup(username,groupName);


    res.redirect(`/group/${id}/`);

  })
  .post("/creategroup/",(req,res)=>{
    let groupName = req.body.name;
    let groupDescription = req.body.description;
    let username = req.session.username;
    console.log(`Username: ${username}`);
    if(username){
      console.log(`Username should be something: ${username}`);
      createGroup(username,groupName,groupDescription);
      let group = findGroup(username,groupName);
      res.redirect(`/group/${group[0].id}/`);
    }
    else{
      res.redirect("/login");
    }
  })
  .post("/groupsearch",(req,res)=>{
    res.set('Access-Control-Allow-Origin', '*');
    let ownerEmail = req.body.email;
    let groupName = req.body.groupName;
    let matches = [];
    if(ownerEmail && groupName){
      matches = findGroup(ownerEmail,groupName);
    }
    else if(ownerEmail){
      matches = findGroup(ownerEmail,undefined);
    }
    else if(groupName){
      matches = findGroup(undefined,groupName);
    }
    if(matches){
      console.log(matches);
      for (let match of matches){
	match.sessions = allGroupSessions(match.id);
	
      }
      res.status(200).json(matches);
    }
    else if (!ownerEmail && !groupName){
      res.status(400).send("Bad request");
    }
    else{
      res.status(200).send("No matches");
    }
  })
  .post("/createsession",(req,res)=>{
    let name = req.body.name;
    let description = req.body.description;
    let location = req.body.location;
    let date = req.body.date;
    let time = req.body.time;
    let groupName = req.body.groupName;
    let rpgid = req.body.rpgid;
    let dateTime = date+" "+time+":00";
    let response = createSession(groupName,dateTime,undefined,name,description,location,rpgid);
    let group = findGroup(undefined,groupName);
    
    
    console.log(groupName);
    res.redirect(`/sessions/${group[0].id}`);
    
  })

  .post("/sendmessage",(req,res)=>{
    let from = req.session.username;
    let to = req.body.toemail;
    let message = req.body.message;
    console.log("From:"+from);
    console.log("To:"+to);
    console.log("Message:"+message);
    if(from && to && message){
      sendMessage(from,to,message);
      res.redirect("/sendmessage");
    }
    else{
      res.status(401).send("Bad info supplied");
    }
  })
  .post("/feedback",(req,res)=>{
    let targetId = req.body.member;
    let username = req.session.username;
    let user = findUserSafe(username);
    let feedback = req.body.feedback;
    let rating = req.body.rating;
    let target = getUserById(targetId);
    console.log("Target id: "+targetId);
    console.log("Username: "+username);
    console.log("User:");
    console.log(user);
    console.log("Rating: "+rating);
    console.log("Comment: "+feedback);
    let expr = db.prepare("SELECT * FROM UserRatings WHERE raterid=? AND targetid=?");
    let info = expr.get(user.id,target.id);
    console.log(info);
    if(info){
      console.log("Already exists...");//update rating
      updateRating(target.email,user.email,rating,feedback);
    }
    else if(user.id==targetId){
      console.log("Can't rate yourself...");
      return res.redirect(`/feedback/${req.body.id}/`);
    }
    else{
      console.log("Creating a new rating");
      rateUser(target.email,user.email,rating,feedback);
    }
    console.log(info);
    res.redirect("/sessions/"+req.body.id);
  })
  .post("/uploadtranscript",(req,res)=>{
    let id = req.body.id;
    let groupid = req.body.groupid;
    let filename = crypto.randomUUID()+".txt";
    let transcript = undefined;
    if(req.files){
      //console.log(`Files: ${req.files}`);
      console.log(req.files.transcript);
      transcript = req.files.transcript;
    }
    else{
      console.log(`Error: ${req.files}`);
    }
    if(transcript){
      transcript.mv("./www/files/"+filename,(err)=>{
	if(err){
	  console.log(`Error: ${err}`);
	}
	else{
	  addTranscript(id,filename);
	}
      });
    }
    else{
      console.log("Why isn't there a file?");
    }
    res.redirect("/sessions/"+groupid);
  })
  .post("/changeowner",(req,res)=>{
    let groupid = req.body.groupid;
    let newOwner = req.body.newowner;
    let group = undefined;
    if(groupid){
      group = getGroupById(groupid);
    }
    if(groupid && newOwner && group){
      
      console.log(`Group name is: ${group.name}`);
      changeOwner(newOwner,group.name);
    }
    else{
      console.log("Something went wrong...");
    }
    res.redirect(`/group/${groupid}/`);
    
  })
  .post("/editgroup",(req,res)=>{
    let groupid = req.body.groupid;
    let name = req.body.name;
    let description = req.body.description;

    if(groupid && name && description){
      let expr = db.prepare("UPDATE Groups SET name=?, description=? WHERE id=?");
      let info = expr.run(name,description,groupid);
      console.log(info);
    }
    res.redirect(`/group/${groupid}`);
  })
  .post("/removeuser",(req,res)=>{
    let groupid = req.body.groupid;
    let remove = req.body.usertoremove;
    let user = findUserSafe(remove);
    let group = getGroupById(groupid);

    if(group && remove && user){
      leaveGroup(user.email,group.name);
      console.log("User removed successfully");
    }
    else{
      console.log(`Something went wrong trying to remove ${remove}`);
    }
    res.redirect(`/group/${groupid}`);
  })
  .post("/deletegroup",(req,res)=>{
    let id = req.body.groupid;
    let group = getGroupById(id);
    if(group){
      deleteGroupByID(id);
      console.log(`Group with id:${id} should be deleted`);
      res.redirect(`/group`);
    }
    else{
      console.log("Something went wrong deleting the group");
      res.redirect(`/group/${id}`);
    }
    
  })
	
module.exports = router;
