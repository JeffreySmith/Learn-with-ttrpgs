"use strict";
//Eventually we'll need to change this. At the very least, away from the name testDB
 global.db_string = "SQL/testDB.db";

const express = require('express');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const session = require('express-session');
const bcrypt = require('bcrypt');

const db = require('better-sqlite3')(global.db_string);
db.pragma('foreign_keys=ON');

const path = require('path');
const nodemailer = require('nodemailer');
const FleschKincaid = require('flesch-kincaid');

const {check,query,validationResult } = require('express-validator');

const get = require('./src/get.js');
const post = require('./src/post.js');
const {insertUser,findUserSafe,rateUser,getUsers} = require('./src/user.js');
const {getGroups,joinGroup,insertGroup,findGroup,deleteGroup,isInGroup,isGroupAdmin,getGroupMembers} = require('./src/groups.js');
const {sendPasswordResetEmail} = require('./src/email.js');
const {groupSessionLevels,createSession,findSession,allGroupSessions} = require('./src/session.js');

console.log(groupSessionLevels(1));

require('dotenv').config();
global.url = process.env.url;
if(process.env.pass == undefined){
  console.log(`You need pass="passwordhere" in .env`);
  console.log("Without it, you won't be able to send emails");
}
//Displays the grade level for the text. Currently here, so I could see it work
//console.log(analyzeGradeLevel("The quick brown fox jumped over the lazy dogs"));
const port = 8000;

//I genuinely don't know if this is the right way to do this. We do have support for a .env file
//now, so we could load it from there
const my_session = {
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: true
};

const app = express();
app.use(session(my_session));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(fileUpload());

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"www/views"));
app.use(express.static(__dirname + "/www"));


db.pragma('foreign_key=ON');

//joinGroup("test@email.com","Group2");

app.use('/',get);
app.use('/',post);

app.listen(port,()=>{
  console.log(`Running server at http://localhost:8000`);
});
