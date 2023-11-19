const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const {check,query,validationResult} = require( 'express-validator');
const {insertUser,findUserSafe,rateUser,getUsers,getUserById} = require('./user.js');
const {getGroups,joinGroup,insertGroup,findGroup,deleteGroup,leaveGroup,createGroup} = require('./groups.js');
const {sendPasswordResetEmail} = require('./email.js');
const {createSession,findSession,allGroupSessions} = require('./session.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getGroupMembers } = require("./groups.js");
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
    res.render("registration",{message:"User account created!"});
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
  .post("/deletegroup",(req,res)=>{
    let groups = getGroups();
    let groupName = req.body.name;
    let group = groups.find((group)=> group.name === groupName);
    if(!group){
      return res.render("group",{message:"No such group exists"});
    }
    deleteGroup(group);
  })
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
    let rpgid = 1;
    let dateTime = date+" "+time+":00";
    let response = createSession(groupName,dateTime,undefined,name,description,location);
    console.log(name);
    console.log(description);
    console.log(location);
    console.log(date);
    console.log(time);

    console.log(groupName);
    res.redirect(`/session/${response.id}`);
    
  })
  .post("/addtranscript/:transcript/",(req,res)=>{
    
  })
module.exports = router;
