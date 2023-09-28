import express, { Express, Request, Response } from 'express';
import * as crypto from "crypto";
import session, { Cookie, Session } from 'express-session';

const sqlite3 = require("sqlite3");
const port = 8000;

const my_session = {
  secret: crypto.randomUUID(),
  resave: false,
  saveUninitialized: true
};

declare module 'express-session'{
  interface SessionData{
    loggedIn:boolean;
    username:string;
  }
}


const app: Express = express();
app.use(session(my_session));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let db = new sqlite3.Database("./SQL/testDB.db", (err: any) => {
  if (err) {
    console.error(err.message);
  }
});

type User = {
  name:string;
  email:string;
  password:string;
  id:number
};
let users:User[] = [];

db.serialize(() => {
  db.each("select * from Users",
    (err: any, row: any) => {
      if (err) {
        console.error(err.message);
      }
      let user:User = {
        id: row.ID,
        name: row.Name,
        email: row.Email,
        password: row.Password
      };
      
      let jSON = JSON.stringify(user);
      users.push(user);
      console.log(jSON);
      console.log(row.ID + "\t" + row.Name);
    });
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello there!");
});
app.get("/user", (_req: Request, res: Response) => {
  let a = JSON.stringify(users[0]);
  res.json(a);
});
app.post("/login", (req: Request, res: Response) => {
  if (req.body.username) {
    console.log(`Username is: ${req.body.username}`);
  }
  if (req.body.password) {
    console.log(`Password is ${req.body.password}`);
  }
  let args = 0;
  for (let arg in req.body){
    args+=1;
  }
  if(args > 2){
    res.status(400).send("Incorrect format");
  }
  
  let successfull = false;
  let email = "";
  let username = "";
  for(let user of users){
    if(req.body.username === user.email && req.body.password === user.password){
      successfull = true;
      email = user.email;
      username = user.email;
    }
  }
  if(successfull){
    req.session.loggedIn = true;
    req.session.username = email;
    
    res.status(200).send(`Succesfully logged in as ${username}`);

  }
  else{ 
    res.status(401).send('Failed to find user');
  }
});


app.listen(port, () => {
  console.log(`Running server on port ${port}`);
});
