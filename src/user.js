
const bcrypt = require('bcrypt');
const db = require('better-sqlite3')(global.db_string);
db.pragma('foreign_key=ON');

function insertUser(name,lastName,email,password,role){
  bcrypt
    .hash(password,10)
    .then(hash=>{
      let expr = db.prepare("INSERT INTO Users (firstname,lastname,password,email,role) VALUES(?,?,?,?,?)");
      let info = expr.run(name,lastName,hash,email,role);
      console.log(info);
    })
    .catch(err=>console.error(err.message));
}

//If you don't need to get the user's password, this is the function you should use
function findUserSafe(email){
  let expr = db.prepare("SELECT id,firstname,lastname,email From Users WHERE email=?");
  let info = expr.get(email);
  return info;
}
function rateUser(targetUserId,userId,rating){
  let target = findUserSafe(targetUserId);
  let rater = findUserSafe(userId);
  
  let expr = "";

  if(target && rater && rating && target.id!==rater.id){
    try{
      expr = db.prepare("INSERT INTO UserRatings (rating,ratedby,ratingfor)");
      let info = expr.run(rating,rater.id,target.id);
      console.log(info);
    }
    catch(err){
      console.log(`Error: ${err}`);
    }
  }
  else{
    console.log(`Info: target user: ${target}, rater: ${rater}, rating: ${rating}`);
  }
}

function getUsers(){
    return db.prepare("SELECT * FROM Users").all();
}


module.exports = {insertUser,findUserSafe,rateUser,getUsers};
