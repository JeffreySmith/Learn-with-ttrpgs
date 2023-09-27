import {Request,Response} from 'express';

export function hello(req:Request,res:Response){
  let name: String|undefined = req.params.name;
  let output = "";
  if(name){
    output = `Hello, ${name}!`;
  }
  else{
    output = "Hello, World!";
  }
  res.send(output);
}
