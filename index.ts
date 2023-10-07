import express, { Express, Request, Response } from 'express';
import * as crypto from "crypto";
import session from 'express-session';
import * as bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import * as path from 'path';
const port = 8000;

const db_string:string = "SQL/testDB.db";

const my_session = {
  secret: crypto.randomUUID(),
  resave: false,
  saveUninitialized: true
};

//Type annotations for things from req.session
declare module 'express-session'{
  interface SessionData{
    loggedIn:boolean;
    username:string;
    role:"admin"|"user";
  }
}

const app: Express = express();
app.use(session(my_session));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"www/views"));
app.use(express.static(__dirname + "/www"));



interface User {
  name:string;
  email:string;
  password:string;
  id:number | null
};

//PublicUser is the only thing that should ever be sent to the browser. We don't want to accidentally send passwords
type PublicUser = Omit<User,'password'>;

interface Group {
  id: number | null;
  owner:User;
  name:string;
};

function getGroups():Group[]{
  const db = new Database(db_string);
  let groups:Group[] = [];
  const rows = db.prepare("SELECT * FROM Groups").all();
  for (let row of rows){
    console.log(row);
    groups.push(row as Group);
  }
  db.close();
  return groups;
}

function insertGroup(owner:User,groupName:string):void {
  let group:Group = {
    id:null,
    name:groupName,
    owner:owner,
  };
  const db = new Database(db_string);
  let expr = db.prepare("INSERT INTO Groups (name,owner) VALUES(?,?)");
  let info = expr.run(group.name,owner.id);
  db.close();
  console.log(info);
}
function deleteGroup(group:Group){
  const db = new Database(db_string);
  let expr = db.prepare("DELETE FROM Groups WHERE id=?");
  let info = expr.run(group.id);
  console.log(info);
  
  db.close();
}
function convertUser (user:User):PublicUser{
  let new_user:PublicUser = {
    name:user.name,
    email:user.email,
    id:user.id
  };
  return new_user;
}

function argCount(args:number,body:object):boolean{
  let arg_count = 0;
  for ( let _ in body){
    arg_count+=1;
  }
  if(arg_count===args){
    return true;
  }
  return false;
}

function getUsers():User[] {
  const db = new Database(db_string);
  let users: User[]=[];
 
  const rows = db.prepare("SELECT * FROM Users").all();
  for (let row of rows){
    users.push(row as User);
  }
  db.close();

  return users;
}
// This function hashes the user's password before saving things to the db
function insert_user(user:User):void{
  const db = new Database(db_string);
  bcrypt
    .hash(user.password,10)
    .then(hash=>{
      let expr = db.prepare("INSERT INTO Users (name,password,email) VALUES(?,?,?)");
      let info = expr.run(user.name,hash,user.email);
      console.log(info);
      console.log(hash);
    })
    .catch(err=>console.error(err.message));
  db.close();
}

app.get("/ejs",(_req:Request, res:Response)=>{
  res.render('index');
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello there!");
});
app.get("/user", (_req: Request, res: Response) => {
  const users:User[] = getUsers();
  let users_nopwd = users.map(u=>convertUser(u));

  res.json(users_nopwd);
});
app.post("/user",(req:Request,res:Response)=>{
  const num_args = 3;
  if(!argCount(num_args,req.body)){
    res.status(400).send("Incorrect format");
  }
  let new_user:User = {
    id:null,
    name:req.body.name,
    email:req.body.email,
    password:req.body.password
  };
  try{
    insert_user(new_user);
    res.status(200).send(`User ${new_user.email} created!`);
  }catch(err){
    res.status(401).send(`Error: ${err}`);
  }
  
});
app.get("/check",(req:Request,res:Response)=>{
  if(req.session.username){
    res.send(`Your username is: ${req.session.username}`);
  }
  else{
    res.send(`No available session?`);
  }
});
//First argument to post: username?
app.post("/group",(req:Request,res:Response) => {
  let foundUser = false;
  if(!argCount(2,req.body)){
    res.status(400).send("Incorrect format");
  }
  let users = getUsers();
  for(let user of users){
    if(user.email === req.body.username){
      foundUser = true;
      try{
        insertGroup(user,req.body.name);
        res.status(200).send(`Successfully created group ${req.body.name}`);
        
      }catch(err){
        res.status(401).send(`Error: ${err}`);
      }
        
      
      
    }
  }
  if (!foundUser){
    res.status(401).send(`User ${req.body.username} was not found`);
  }
});
app.post("/login", (req: Request, res: Response) => {
  
  if(!argCount(2,req.body)){
    res.status(400).send("Incorrect format");
  }
  
  let users = getUsers();
  users.map(u=>console.log(u));
  for(let user of users){
    if(req.body.username === user.email){
      bcrypt
        .compare(req.body.password, user.password)
        .then(result => {
          console.log(`Password matches: ${result}`);
          if(result){
            req.session.loggedIn = true;
            req.session.username = user.email;
            res.status(200).send(`Succesfully logged in as ${req.session.username}`);
          }
          else{
            res.status(401).send(`Failed to find user`);
          }

        })
        .catch(err => {
          console.error(err.message)
          res.status(401).send(`${err.message}`);
        })
    }
  }
});
app.post("/deletegroup", (req:Request,res:Response)=>{
  let groups:Group[] = getGroups();
  if(!argCount(1,req.body)){
    res.status(400).send("Incorrect format");
  }
  for(let group of groups){
    console.log(group.name);
    if(group.name === req.body.groupname){
      deleteGroup(group);
      console.log(`Deleted group ${group.name}`);
      break;
    }
  }
  
  res.status(200).send("Deleted");
});
  


app.listen(port, () => {
  console.log(`Running server on port ${port}`);
});
