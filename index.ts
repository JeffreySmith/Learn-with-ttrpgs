import express, { Express, Request, Response } from 'express';
import * as crypto from "crypto";
import session, { Cookie, Session } from 'express-session';
import * as bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
//const sqlite3 = require("sqlite3");
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
bcrypt
  .compare("54321","$2b$10$QiAdjxrfixKQVxf1xhf8ou9XRRwPcn3fN9CXR3FbnDWNM5WNBkqHu")
  .then(result=>{
    console.log(result);
  })
  .catch(err=>console.error(err.message));

const app: Express = express();
app.use(session(my_session));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*let db:Database = new Database("./SQL/testDB.db", (err: any) => {
  if (err) {
    console.error(err.message);
    process.exit();
  }
});
*/
const db = new Database('SQL/testDB.db');
interface User {
  name:string;
  email:string;
  password:string;
  id:number | null
};
/*interface PublicUser  {
  name:string;
  email:string;
  id:number|null;
  };
*/
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

function argCount(args:number,body:object){
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
  console.log(`Name: ${new_user.name}, email: ${new_user.email}, password: ${new_user.password}`);
  res.status(200).send("User created!")
  
});
app.post("/login", (req: Request, res: Response) => {
  
  if (req.body.username) {
    console.log(`Username is: ${req.body.username}`);
  }
  if (req.body.password) {
    console.log(`Password is ${req.body.password}`);
  }
  
  if(!argCount(2,req.body)){
    res.status(400).send("Incorrect format");
  }
  
  let successfull = false;
  let email = "";
  let username = "";
  for(let user of get_users()){
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
