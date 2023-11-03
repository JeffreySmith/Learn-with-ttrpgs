#!/usr/bin/env node
"use strict";
const express = require('express');
const crypto = require('crypto');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');
const nodemailer = require('nodemailer');
const FleschKincaid = require('flesch-kincaid');
const { exit } = require('process');
const { query,validationResult } = require('express-validator');
const {check} = require( 'express-validator');

require('dotenv').config();

if(process.env.pass == undefined){
  console.log(`You need pass="passwordhere" in .env`);
  console.log("Without it, you won't be able to send emails");
}

console.log(analyzeGradeLevel("The quick brown fox jumped over the lazy dogs"));
const port = 8000;

//I genuinely don't know if this is the right way to do this. We do have support for a .env file
//now, so we could load it from there
const my_session = {
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: true
};

//I know the following code works, so I don't want to delete it yet
/*
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'ttrpglearning@gmail.com',
    pass:process.env.pass
  }
});

const mailOptions = {
  from:'ttrpglearning@gmail.com',
  to:'test@test.com', //Address to which you want to send
  subject:'Sending email via node.js', //subject
  text:"If this email makes it to you, I've figured out how to send emails via node.js" //body of email
};
transporter.sendMail(mailOptions,(error,info)=>{
  if(error){
    console.log(error);
  }
  else{
    console.log(`Email sent: `+info.response);
  }
});
*/
const app = express();
app.use(session(my_session));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"www/views"));
app.use(express.static(__dirname + "/www"));

//Eventually we'll need to change this. At the very least, away from the name testDB
const db_string = "SQL/testDB.db";
const db = new Database(db_string);

console.log(findGroup(undefined,"Group2"));
joinGroup("test@email.com","Group2");

function getUsers(){
    return db.prepare("SELECT * FROM Users").all();
}

function analyzeGradeLevel(string){
  return FleschKincaid.grade(string);
}


function getGroups() {
  return  db.prepare("SELECT * FROM Groups").all();
}
function joinGroup(userEmail,groupName){
  let user = findUserSafe(userEmail);
  let group = findGroup(undefined,groupName);
  
  if(group.length === 1){
    group = group[0];
    
    try{
      let expr = db.prepare("INSERT INTO GroupMembers (userid,groupid) VALUES(?,?);");
      let info = expr.run(user.id, group.id);
      console.log(info);
      return true;
    }
    catch(err){
      console.log(`Error:\n${err}`);
    }
  }
  return false;
}
function insertUser(name,email,password){
  bcrypt
    .hash(password,10)
    .then(hash=>{
      let expr = db.prepare("INSERT INTO Users (name,password,email) VALUES(?,?,?)");
      let info = expr.run(name,hash,email);
      console.log(info);
    })
    .catch(err=>console.error(err.message));
}

//Make sure you don't try to bind an object to one of the values.
//Trust me, it doesn't work
function insertGroup(owner,name,description){
  let expr = db.prepare("INSERT INTO Groups (name,owner,description) VALUES(?,?,?)");
  let info = expr.run(name,findUserSafe(owner.email).id,description);
  console.log(`Insert group response: ${info}`);
}

//If you don't need to get the user's password, this is the function you should use
function findUserSafe(email){
  let expr = db.prepare("SELECT id,name,email From Users WHERE email=?");
  let info = expr.get(email);
  return info;
}

function findGroup(ownerEmail,name){
  let user = findUserSafe(ownerEmail);
  let expr = "";
  let matchingGroups = undefined;
  if (user && name){
    expr = db.prepare("SELECT id,name,description FROM Groups WHERE name=? AND Owner=?");
    matchingGroups = expr.all(name,user.id);
  }
  else if(user){
    expr = db.prepare("SELECT id,name,description FROM Groups WHERE OWNER=?");
    matchingGroups = expr.all(user.id);
  }
  else if (name){
    expr = db.prepare("SELECT id,name,description FROM Groups WHERE name=?");
    matchingGroups = expr.all(name);
  }

  return matchingGroups;
}
function createSession(groupName,time,transcript){
  let group = findGroup(undefined,groupName);
  group = group[0];
  let expr = "";
  if(!transcript){
    expr = db.prepare("INSERT INTO Sessions (groupid,time) VALUES (?,?)");
    expr.run(group.id,time);
  }
  else if(transcript){
    expr = db.prepare("INSERT INTO Sessions (groupid,time,transcript) VALUES (?,?)");
    expr.run(group.id,time,transcript);
  }

}
function findSession(id){
  let expr = db.prepare("SELECT * FROM Sessions WHERE id=?");
  let session = expr.all(id);
  session = session[0];

  expr = db.prepare("SELECT *,name FROM Sessions INNER JOIN Groups ON Sessions.groupid = Groups.id WHERE Groups.id=?");
  let name = expr.all(session.groupid);
  name = name[0].name;
  console.log(`Found name: ${name}`);
  session.name=name;
  return session;
}

function deleteGroup(group){
  let expr = db.prepare("DELETE FROM Groups where id=?");
  let info = expr.run(group.id);
  console.log(info);
}
//This creates the object for 
function getTransporter(){
  return nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:'ttrpglearning@gmail.com',
      pass:process.env.pass
    }
  });
}
function sendMail(transporter,mailOptions){
  transporter.sendMail(mailOptions,(error,info)=>{
    if(error){
      console.log(error);
    }
    else{
      console.log(`Email sent: ${info.response}`);
    }
  });
}
function sendPasswordResetEmail(email){
  const transporter = getTransporter();

  const mailOptions = {
    from:'ttrpglearning@gmail.com',
    to:email, //Address to which you want to send
    subject:'Password Reset', //subject
    text:"Click this link to reset your password <link goes here>" //body of email
  };
  sendMail(transporter,mailOptions);
}


app.get("/",(req,res)=>{
  
  if(req.session.username){
    let user = getUsers().find((user)=>user.email === req.session.username);
    res.render("index",{user:user});
  }
  else{
    res.render("index");
  }
});
app.get("/group",(req,res)=>{
  let users = getUsers();
  res.render("creategroup",{users:users});
});
app.get("/check",(req,res)=>{
  if(req.session.username){
    res.send(`You're logged in as ${req.session.username}`);
  }
  else{
    res.send("Please log in");
  }
});
app.get("/register",(req,res)=>{
  res.render("registration");
});
app.get("/login",(req,res)=>{
  res.render("login");
});
app.get("/userpage",(req,res)=>{
  if(req.session.loggedIn){
    let user = getUsers().find((user)=> user.email === req.session.username);
    res.render("userpage",{user:user});
  }
  else{
    res.redirect("/login");
  }
});
app.get("/session/:id/",(req,res)=>{
  let id = req.params.id;
  let errors = [];
  let session = findSession(id);
  let groups = getGroups();
  console.log(session);
  /*if(errors.length === 0){
    res.render("sessionpage",{errors:errors});
    }*/

  if(session != undefined){
    console.log(session);
    res.render("sessionpage",{session:session,groups:groups});
  }
  else{
    res.render("sessionpage",{groups:groups});
  }
});
app.post("/session",(req,res)=>{
  let time = req.body.time;
  let group = req.body.group;
  time = time.replace("T"," ")+":00";
  createSession(group,time);
  console.log(time);
  console.log(group);
  res.render("sessionpage");
});
app.post("/register",[check('name',"Please enter a name").notEmpty(),check('email',"Please enter a valid email").isEmail(),check('password',"Please enter a password").notEmpty(),check('confirmPassword',"Please confirm your password").notEmpty()],(req,res)=>{
  
  const errors = validationResult(req);
  console.log(errors);
  if(!errors.isEmpty()){
    return res.render("registration",{errors:errors.array()});
  }
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  insertUser(name,email,password);
  //res.send("Pretend that we definitely did that right. Eventually we'll check this server-side");
  res.render("registration",{message:"User account created!"});
});

app.post("/login",[
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
});
app.post("/logout",(req,res)=>{
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
});

app.post("/group",(req,res)=>{
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
});
app.post("/findgroup",(req,res)=>{
  let name = req.body.name;
  //TODO join Groups and Users table
  let owner = req.body.owneremail;
  let groups = getGroups();
  let group = "";
  if(name){
    group = groups.find((group)=> group.name === name);
    console.log(group);
  }

});
app.post("/deletegroup",(req,res)=>{
  let groups = getGroups();
  let groupName = req.body.name;
  let group = groups.find((group)=> group.name === groupName);
  if(!group){
    return res.render("group",{message:"No such group exists"});
  }
  deleteGroup(group);
});
app.post("/groupsearch",(req,res)=>{
  
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
});

app.listen(port,()=>{
  console.log(`Running server at http://localhost:8000`);
});
