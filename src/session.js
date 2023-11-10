const FleschKincaid = require('flesch-kincaid');
const {insertUser,findUserSafe,rateUser,getUsers} = require('./user.js');
const {getGroups,joinGroup,insertGroup,findGroup,deleteGroup} = require('./groups.js');
const fs = require('fs');
const db = require('better-sqlite3')(global.db_string);
db.pragma('foreign_keys=ON');


function analyzeGradeLevel(string){
  return FleschKincaid.grade(string);
}
function groupSessionLevels(groupID){
  let expr = db.prepare("SELECT * FROM Sessions WHERE groupid=? AND transcript IS NOT NULL");
  let rows = expr.all(groupID);
  let sessionInfo = [];
  for (let row of rows){
    sessionInfo.push({id:row.id,date:row.time,transcript:row.transcript});
  }
  return sessionInfo;
}

function createSession(groupName,time,transcript){
  let group = findGroup(undefined,groupName);
  group = group[0];
  let expr = "";
  if(!transcript){
    expr = db.prepare("INSERT INTO Sessions (groupid,time) VALUES (?,?)");
    expr.run(group.id,time);
  }
  else if(transcript){
    expr = db.prepare("INSERT INTO Sessions (groupid,time,transcript) VALUES (?,?)");
    expr.run(group.id,time,transcript);
  }
}
function getTranscriptAnalysis(transcript){
  let fileContent = fs.readFileSync("www/files/"+transcript).toString();
  let analysis = Math.floor(analyzeGradeLevel(fileContent));
  return analysis;
  
};
function addTranscript(sessionid,transcript){
  let expr = db.prepare("UPDATE Sessions SET transcript = ? WHERE id=?");
  let info = expr.run(transcript,sessionid);
  console.log(info);
}
function findSession(id){
  let expr = db.prepare("SELECT * FROM Sessions WHERE id=?");
  let session = expr.all(id);
  let name = [];
  session = session[0];
  
  expr = db.prepare("SELECT *,name FROM Sessions INNER JOIN Groups ON Sessions.groupid = Groups.id WHERE Groups.id=?");
  
  name = expr.all(session.groupid);
  name = name[0].name;
  
  
  if(session.transcript){
    //load transcript text here
    session.languageLevel = getTranscriptAnalysis(session.transcript);
  }
  console.log(`Found name: ${name}`);
  session.name=name;
  console.log(session);
  return session;
  
}
function allGroupSessions(groupId){
  let expr = db.prepare("SELECT Sessions.id,Sessions.groupid,Sessions.time,RPG.name,Sessions.transcript FROM Sessions INNER JOIN RPG ON rpgid=RPG.id WHERE groupid=?");
  let results = expr.all(groupId);
  return results;
}
module.exports = {createSession,findSession,allGroupSessions,addTranscript,groupSessionLevels};
