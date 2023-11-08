const {insertUser,findUserSafe,rateUser} = require('./user');

const db = require('better-sqlite3')(global.db_string);
db.pragma('foreign_keys=ON');

function getGroups() {
  return  db.prepare("SELECT * FROM Groups").all();
}

function joinGroup(userEmail,groupName){
  let user = findUserSafe(userEmail);
  let group = findGroup(undefined,groupName);
  
  if(group.length === 1){
    group = group[0];
    
    try{
      let expr = db.prepare("INSERT INTO GroupMembers (userid,groupid) VALUES(?,?);");
      let info = expr.run(user.id, group.id);
      console.log(info);
      return true;
    }
    catch(err){
      console.log("You're probably trying to add a user to a group that's already in it");
      console.log(`Error:\n${err}`);
    }
  }
  return false;
}


//Make sure you don't try to bind an object to one of the values.
//Trust me, it doesn't work
function insertGroup(owner,name,description){
  let expr = db.prepare("INSERT INTO Groups (name,owner,description) VALUES(?,?,?)");
  let info = expr.run(name,findUserSafe(owner.email).id,description);
  console.log(`Insert group response: ${info}`);
}


function findGroup(ownerEmail,name){
  let user = findUserSafe(ownerEmail);
  let expr = "";
  let matchingGroups = undefined;
  if (user && name){
    expr = db.prepare("SELECT id,name,description FROM Groups WHERE name=? AND Owner=?");
    matchingGroups = expr.all(name,user.id);
  }
  else if(user){
    expr = db.prepare("SELECT id,name,description FROM Groups WHERE OWNER=?");
    matchingGroups = expr.all(user.id);
  }
  else if (name){
    expr = db.prepare("SELECT id,name,description FROM Groups WHERE name=?");
    matchingGroups = expr.all(name);
  }

  return matchingGroups;
}

function deleteGroup(group){
  let expr = db.prepare("DELETE FROM Groups where id=?");
  let info = expr.run(group.id);
  console.log(info);
}


module.exports = {getGroups,joinGroup,insertGroup,findGroup,deleteGroup};
