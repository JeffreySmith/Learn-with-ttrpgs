import {Request,Response} from 'express';

export function hello(req:Request,res:Response){
  const name: string|undefined = req.params.name;
  let output = "";
  
  if(name){
    output = `Hello, ${name}!`;
  }
  else{
    output = "Hello, World!";
  }
  res.send(output);
}
export function userData(req:Request, res:Response){
  const input = req.body;

  console.log(input);
  res.status(201).send(input);
}
export function returnJson(req:Request,res:Response){
  const user = {
    "Name":"Jeffrey",
    "Age":31,
    Location:"Guelph"
  };
  res.json(user);

}
