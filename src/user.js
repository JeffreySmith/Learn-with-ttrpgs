
const bcrypt = require('bcrypt');
function insertUser(name,email,password,role){
  bcrypt
    .hash(password,10)
    .then(hash=>{
      let expr = global.db.prepare("INSERT INTO Users (name,password,email,role) VALUES(?,?,?,?)");
      let info = expr.run(name,hash,email,role);
      console.log(info);
    })
    .catch(err=>console.error(err.message));
}

//If you don't need to get the user's password, this is the function you should use
function findUserSafe(email){
  let expr = global.db.prepare("SELECT id,name,email From Users WHERE email=?");
  let info = expr.get(email);
  return info;
}
function rateUser(targetUserId,userId,rating){
  let target = findUserSafe(targetUserId);
  let rater = findUserSafe(userId);
  
  let expr = "";

  if(target && rater && rating && target.id!==rater.id){
    try{
      expr = global.db.prepare("INSERT INTO UserRatings (rating,ratedby,ratingfor)");
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
    return global.db.prepare("SELECT * FROM Users").all();
}


module.exports = {insertUser,findUserSafe,rateUser,getUsers};
