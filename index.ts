import express, { Express, Request, Response } from 'express';
import * as crypto from "crypto";
import session, { Cookie, Session } from 'express-session';

const sqlite3 = require("sqlite3");
const port = 8000;

const my_session = {
  secret:crypto.randomUUID(),
  resave:false,
  saveUninitialized:true
};

const app:Express = express();
app.use(session(my_session));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
let db = new sqlite3.Database("./SQL/testDB.db", (err:any) => {
  if (err) {
    console.error(err.message);
  }
});

let user = {};
db.serialize(()=>{
    db.each("select * from Users",
	    (err:any,row:any)=>{
		if(err){
		    console.error(err.message);
		}
		user = {id:row.ID,
			name:row.Name,
			email:row.Email
		       };
		let jSON = JSON.stringify(user);
		console.log(jSON);
		console.log(row.ID+"\t"+row.Name);
	    });
});

app.get("/",(req:Request,res:Response)=>{
  res.send("Hello there!");
});
app.get("/user",(req:Request,res:Response)=>{
  res.json(user);
});
app.post("/login",(req:Request,res:Response)=>{
  console.log(req.body);
  res.send(req.body);
  if(req.body.username){
    console.log(`Username is: ${req.body.username}`);
  }
  if(req.body.password){
    console.log(`Password is ${req.body.password}`);
  }
});
app.listen(port,()=>{
  console.log(`Running server on port ${port}`);
});
