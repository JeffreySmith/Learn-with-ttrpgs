const express = require('express');
const router = express.Router();
const {check,query,validationResult} = require( 'express-validator');
const {insertUser,findUserSafe,rateUser,getUsers} = require('./user.js');
const {getGroups,joinGroup,insertGroup,findGroup,deleteGroup} = require('./groups.js');
const {sendPasswordResetEmail} = require('./email.js');
const {createSession,findSession,allGroupSessions} = require('./session.js');
const bcrypt = require('bcrypt');

const db = require('better-sqlite3')(global.db_string);
db.pragma('foreign_keys=ON');

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
    if(errors.length>0 || localErrors.length > 0){
      //{errors:errors.array()}
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
    let time = req.body.time;
    let group = req.body.group;
    time = time.replace("T"," ")+":00";
    createSession(group,time);
    console.log(time);
    console.log(group);
    res.render("sessionpage");
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
  .post("/register",[check('name',"Please enter a name").notEmpty(),check('email',"Please enter a valid email").isEmail(),check('password',"Please enter a password").notEmpty(),check('confirmPassword',"Please confirm your password").notEmpty()],(req,res)=>{
  
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()){
      return res.render("registration",{errors:errors.array()});
    }
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    insertUser(name,email,password,"user");
    //res.send("Pretend that we definitely did that right. Eventually we'll check this server-side");
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
            res.render("login",{message:"You've logged in successfully!"});

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
  .post("/group",(req,res)=>{
    let email = req.body.owner;
    let name = req.body.name;
    let description = req.body.description;
    let users = getUsers();
    console.log(`Email:${email}`);
    console.log(`Name:${name}`);
    const user = users.find((user)=> user.email === email);
    if(!user){
      return res.render("creategroup",{error:"User doesn't exist"});
    }
    insertGroup(user,name,description);
    res.render("creategroup",{message:"Successfull"});
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
  .post("/groupsearch",(req,res)=>{
    
    let ownerEmail = req.body.email;
    let groupName = req.body.groupName;
    let matches = findGroup(ownerEmail,groupName);
    if(matches){
      res.status(200).json(matches);
    }
    else if (!ownerEmail && !groupName){
      res.status(400).send("Bad request");
    }
    else{
      res.status(200).send("No matches");
    }
  })
module.exports = router;
