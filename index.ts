import express,{Express,Request,Response} from 'express';
import dotenv from 'dotenv';
import * as routes from "./src/routes/hello";
dotenv.config();

const app:Express = express();
const port = process.env.PORT;

app.get('/',(req:Request,res:Response) => {
  res.send('Express & TypeScript server!');
});

app.get('/hello/:name',routes.hello);

app.listen(port,()=>{
  console.log(`Server is running at http://localhost:${port}`);
});
