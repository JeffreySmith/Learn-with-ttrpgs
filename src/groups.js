const { insertUser, findUserSafe, rateUser } = require("./user");

const db = require("better-sqlite3")(global.db_string);
db.pragma("foreign_keys=ON");

function getGroups() {
  return db.prepare("SELECT * FROM Groups").all();
}

function isGroupAdmin(email, groupName) {
  let group = findGroup(email, groupName);
  if (group.length === 1) {
    return true;
  } else {
    return false;
  }
}

function getGroupMembers(groupName) {
  let group = findGroup(undefined, groupName);
  if (group.length === 1) {
    group = group[0];
  } else {
    return undefined;
  }
  let expr = db.prepare(
    "SELECT * FROM GroupMembers INNER JOIN Users ON GroupMembers.userid = Users.id WHERE groupid=?"
  );
  const rows = expr.all(group.id);
  return rows;
}

function isInGroup(email, groupName) {
  let user = findUserSafe(email);
  let group = findGroup(undefined, groupName);

  if (group && group.length === 1 && user) {
    group = group[0];
    let expr = db.prepare(
      "SELECT * FROM GroupMembers WHERE userid=? AND groupid=?"
    );
    let info = expr.get(user.id, group.id);
    console.log(info);
    if (info.userid == user.id && info.groupid == group.id) {
      return true;
    } else {
      return false;
    }
  }

  return false;
}
function createGroup(userEmail, groupName, groupDescription) {
  let user = findUserSafe(userEmail);
  console.log(user);
  let expr = db.prepare(
    "INSERT INTO Groups (name,description,owner) VALUES (?,?,?)"
  );
  let info = expr.run(groupName, groupDescription, user.id);
  console.log(info);
  joinGroup(userEmail, groupName);
}
function joinGroup(userEmail, groupName) {
  let user = findUserSafe(userEmail);
  let group = findGroup(undefined, groupName);

  if (group.length === 1) {
    group = group[0];

    try {
      let expr = db.prepare(
        "INSERT INTO GroupMembers (userid,groupid) VALUES(?,?);"
      );
      let info = expr.run(user.id, group.id);
      console.log(info);
      return true;
    } catch (err) {
      console.error(
        "You're probably trying to add a user to a group that's already in it"
      );
      console.error(`Error:\n${err}`);
    }
  }
  return false;
}

function leaveGroup(userEmail, groupName) {
  let user = findUserSafe(userEmail);
  let group = findGroup(undefined, groupName);
  if (group.length === 1) {
    group = group[0];
    try {
      let expr = db.prepare(
        "DELETE FROM GroupMembers WHERE userid=? AND groupid=?"
      );
      let info = expr.run(user.id, group.id);
      console.log(info);
      return true;
    } catch (err) {
      console.error(`Error: ${err}`);
    }
    return false;
  }
}

function changeOwner(newOwnerEmail, groupName) {
  let newOwner = findUserSafe(newOwnerEmail);
  let group = findGroup(groupName);
  if (group.length >= 1) {
    group = group[0];
  } else {
    return undefined;
  }

  if (newOwner && group) {
    let expr = db.prepare("UPDATE Groups SET owner = ? WHERE id = ?");
    let info = expr.run(user.id, group.id);
    console.log(info);
  }
}

function updateGroupInfo(groupName, newGroupName, description) {
  let group = findGroup(undefined, groupName);
  if (group.length === 1) {
    group = group[0];
  } else {
    console.error("More than one group was returned. This should not happen");
  }

  if (newGroupName) {
    let expr = db.prepare("UPDATE Groups SET name = ? WHERE id = ?");
    let info = expr.run(newGroupName, group.id);
    console.log(info);
  }
  if (description) {
    let expr = db.prepare("UPDATE Groups SET description = ? WHERE id = ?");
    let info = expr.run(description, group.id);
    console.log(info);
  }
}

function removeByModeration(userEmail, groupName, adminUserEmail) {
  let admin = findUserSafe(adminUserEmail);
  let user = findUserSafe(userEmail);
  let group = [];
  if (admin.role == "admin") {
    group = findGroup(undefined, groupName);
    if (group.length > 0) {
      group = group[0];
    } else {
      return false;
    }
  } else if (findGroup(adminUserEmail, groupName)) {
    group = findGroup(adminUserEmail, groupName);
    if (group.length > 0) {
      group = group[0];
    } else {
      return false;
    }
  } else {
    return false;
  }

  let expr = db.prepare(
    "DELETE FROM GroupMembers WHERE userid=? AND groupid=?"
  );
  let info = expr.run(user.id, group.id);
  console.log(info);
  return true;
}

//make sure you don't try to bind an object to one of the values.
//Trust me, it doesn't work
function insertGroup(owner, name, description) {
  let expr = db.prepare(
    "INSERT INTO Groups (name,owner,description) VALUES(?,?,?)"
  );
  let info = expr.run(name, findUserSafe(owner.email).id, description);
  console.log(`Insert group response: ${info}`);
}

function getGroupsByName(name) {
  expr = db.prepare("SELECT * FROM Groups WHERE name LIKE ? ORDER BY name");
  matchingGroups = expr.all("%" + name + "%");
  return matchingGroups;
}

function findGroup(ownerEmail, name) {
  let user = findUserSafe(ownerEmail);
  let expr = "";
  let matchingGroups = undefined;
  if (user && name) {
    expr = db.prepare("SELECT * FROM Groups WHERE name=? AND Owner=?");
    matchingGroups = expr.all(name, user.id);
  } else if (user) {
    expr = db.prepare("SELECT * FROM Groups WHERE OWNER=?");
    matchingGroups = expr.all(user.id);
  } else if (name) {
    expr = db.prepare("SELECT * FROM Groups WHERE name=?");
    matchingGroups = expr.all(name);
  }

  return matchingGroups;
}


function deleteGroupByID(id){
  //Start a transaction so that if something goes wrong, we don't break things too badly
  const deleteTheGroup = db.transaction(()=>{
    let groupMembers = db.prepare("DELETE FROM GroupMembers WHERE groupid=?");
    let info = groupMembers.run(id);
    console.log(info);
    
    let sessions = db.prepare("DELETE FROM Sessions WHERE groupid=?");
    info = sessions.run(id);
    console.log(info);
    let groups = db.prepare("DELETE FROM Groups where id=?");
    info = groups.run(id);
    console.log(info);
  });
  let info = deleteTheGroup();
  console.log(info);



}
function getGroupById(id) {
  let expr = db.prepare("SELECT * FROM Groups where id=?");
  let output = expr.get(id);
  return output;
}



module.exports = {getGroupsByName,getGroups,joinGroup,insertGroup,findGroup,deleteGroupByID,isInGroup,isGroupAdmin,getGroupMembers,leaveGroup,changeOwner,removeByModeration,updateGroupInfo,getGroupById,createGroup};

