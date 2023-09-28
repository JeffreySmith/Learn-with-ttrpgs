const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const port = 8000;
const my_session = {
    secret: crypto.randomUUID(),
    cookie: {},
    resave: false,
    saveUninitialized:true
};

const app = express();
app.use(session(my_session));


let db = new sqlite3.Database("./SQL/testDB.db",(err)=>{
    if(err){
	console.error(err.message);
    }
});
let user = {};
db.serialize(()=>{
    db.each("select * from Users",
	    (err,row)=>{
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
	    

app.get("/",(req,res)=>{
    res.send("Hello World!");
});
app.get("/user",(req,res)=>{
    res.json(user);
});
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});
