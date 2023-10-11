"use strict";
const express = require('express');
const crypto = require('crypto');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const port = 8000;

const my_session = {
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: true
};

const app = express();
app.use(session(my_session));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"www/views"));
app.use(express.static(__dirname + "/www"));
	
const db_string = "SQL/testDB.db";
const db = new Database(db_string);

function getUsers(){
    return db.prepare("SELECT * FROM Users").all();
}

function getGroups() {
  return  db.prepare("SELECT * FROM Groups").all();
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

function insertGroup(owner,name){
  let expr = db.prepare("INSERT INTO Groups (name,owner) VALUES(?,?)");
  let info = expr.run(name,findUserSafe(owner).id);
  console.log(info);
}

function findUserSafe(email){
  let rows = db.prepare("SELECT id,name,email From Users WHERE email=?").all(email);
  return rows;
}
function deleteGroup(group){
  let expr = db.prepare("DELETE FROM Groups where id=?");
  let info = expr.run(group.id);
  console.log(info);
}
app.get("/",(req,res)=>{
  console.log(findUserSafe("test@email.com"));
  res.render("index");
});
app.get("/group",(req,res)=>{
  res.render("group");
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

app.post("/register",(req,res)=>{
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  insertUser(name,email,password);
  res.send("Pretend that we definitely did that right. Eventually we'll check this server-side");
});

app.post("/login", (req, res) => {
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
  let email = req.body.email;
  let name = req.body.name;
  let users = getUsers();
  const user = users.find((user)=> user.email === email);
  if(!user){
    return res.render("group",{error:"User doesn't exist"});
  }
  insertGroup(user,name);
  res.render("group",{message:"Successfull"});
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

app.listen(port,()=>{
  console.log(`Running server at http://localhost:8000`);
});
