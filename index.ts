import express, { Express, Request, Response } from 'express';
import * as crypto from "crypto";
import session, { Cookie, Session } from 'express-session';
import * as bcrypt from 'bcrypt';
import Database from 'better-sqlite3';

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


const db = new Database('SQL/testDB.db');
interface User {
  name:string;
  email:string;
  password:string;
  id:number | null
};
//PublicUser is the only thing that should ever be sent to the browser. We don't want to accidentally send passwords
type PublicUser = Omit<User,'password'>;
function convertUser (user:User):PublicUser{
  console.log(user.name);
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

function get_users():User[] {
  let users: User[]=[];
 
  const rows = db.prepare("SELECT * FROM Users").all();
  for (let row of rows){
    let json = JSON.stringify(row);
    users.push(JSON.parse(json as string));
  }

  return users;
}
// This function hashes the user's password before saving things to the db
function insert_user(user:User){
  bcrypt
    .hash(user.password,10)
    .then(hash=>{
      let expr = db.prepare("INSERT INTO Users (name,password,email) VALUES(?,?,?)");
      let info = expr.run(user.name,hash,user.email);
      console.log(info);
      console.log(hash);
    })
    .catch(err=>console.error(err.message));
}
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello there!");
});
app.get("/user", (_req: Request, res: Response) => {
  const users:User[] = get_users();
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
  insert_user(new_user);
  res.status(200).send(`User ${new_user.email} created!`);
  
});
app.get("/check",(req:Request,res:Response)=>{
  if(req.session.username){
    res.send(`Your username is: ${req.session.username}`);
  }
  else{
    res.send(`No available session?`);
  }
});
app.post("/login", (req: Request, res: Response) => {
  
  if(!argCount(2,req.body)){
    res.status(400).send("Incorrect format");
  }
  
  let users = get_users();
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

  


app.listen(port, () => {
  console.log(`Running server on port ${port}`);
});
