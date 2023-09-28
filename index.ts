import express,{Express,Request,Response} from 'express';
import dotenv from 'dotenv';
import * as routes from "./src/routes/hello";
import bodyParser from 'body-parser';
import {v4 as uuidv4} from 'uuid';

dotenv.config();
const app:Express = express();
const port = process.env.PORT;
const session = require('express-session');
const session_info = {
  secret:uuidv4(),
  cookie:{},
  resave:false,
  saveUninitialized:true
};
console.log(session_info.secret);

app.use(session(session_info));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended:true,
  }),
);

if(!port){
  console.log("Please create a .env file with PORT=portnumber");
  process.exit();
}

app.get('/',(req:Request,res:Response) => {
  res.send('Express & TypeScript server!');
});

app.get('/hello/:name',routes.hello);
app.post('/hello',routes.userData);
app.get('/json',routes.returnJson);
app.listen(port,()=>{
  console.log(`Server is running at http://localhost:${port}`);
});
