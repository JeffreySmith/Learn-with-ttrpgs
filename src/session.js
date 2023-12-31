const FleschKincaid = require("flesch-kincaid");
const { insertUser, findUserSafe, rateUser, getUsers, getUserById } = require("./user.js");
const {getGroups,joinGroup,insertGroup,findGroup,deleteGroup,isInGroup} = require("./groups.js");
const fs = require("fs");
const { sendSessionToGroupMembers } = require("./email.js");
const db = require("better-sqlite3")(global.db_string);
db.pragma("foreign_keys=ON");

//Round to the nearest .25
function round(num) {
  return Math.round(num / 0.25) * 0.25;
}

function analyzeGradeLevel(string) {
  return round(FleschKincaid.grade(string));
}

function getGradeLevel(sessionID) {
  let expr = db.prepare(
    "SELECT * FROM Sessions WHERE id=? AND transcript IS NOT NULL"
  );
  let info = expr.get(sessionID);
  if (info) {
    return getTranscriptAnalysis(info.transcript);
  } else {
    return undefined;
  }
}

function groupSessionLevels(groupID) {
  let expr = db.prepare(
    "SELECT * FROM Sessions WHERE groupid=? AND transcript IS NOT NULL"
  );
  let rows = expr.all(groupID);
  let sessionInfo = [];
  for (let row of rows) {
    sessionInfo.push({
      id: row.id,
      date: row.time,
      transcript: row.transcript,
    });
  }
  return sessionInfo;
}
function getAverageSessionLevel(groupID){
  let sessionInfo = groupSessionLevels(groupID);
  let sum = 0;
  let numberOfElements = 0;
  for (let session of sessionInfo){
    if(session.transcript){
      sum += getGradeLevel(session.id);
      numberOfElements += 1;
    }
  }
  let avg = sum/numberOfElements;
  return avg;
}

function getUserAverage(userid){
  let user = getUserById(userid);
  let groups = db.prepare("SELECT * FROM GroupMembers INNER JOIN Users ON GroupMembers.userid=Users.id WHERE userid=?").all(userid);
  let sum = 0;
  let elems = 0;
  for(let group of groups){
    let temp_sum = getAverageSessionLevel(group.id);
    if(temp_sum>0){
      sum += temp_sum;
      elems +=1;
    }
  }
  return (sum/elems);
}

function createSession(groupName,time,transcript,name,description,location,rpgid) {
  let group = findGroup(undefined, groupName);
  group = group[0];
  let expr = "";
  let id = "";
  if (!transcript) {
    expr = db.prepare(
      "INSERT INTO Sessions (groupid,time,name,description,location,rpgid) VALUES (?,?,?,?,?,?)"
    );
    expr.run(group.id, time, name, description, location, rpgid);
  } else if (transcript) {
    expr = db.prepare(
      "INSERT INTO Sessions (groupid,time,transcript,name,description,location,rpgid) VALUES (?,?,?,?,?,?)"
    );
    expr.run(group.id, time, transcript, name, description, location, rpgid);
  }
  expr = db.prepare("SELECT id FROM Sessions WHERE groupid=? AND time=?");
  let info = expr.get(group.id, time);

  const charactersToRemove = 3;
  sendSessionToGroupMembers(`You have a new session scheduled for ${groupName} at ${time.substring(0,time.length - charactersToRemove)}`,groupName);

  return info;
}

function updateSession(time,name,description,location,rpgid,sessionid){
  let expr = db.prepare("UPDATE Sessions SET time=?,name=?,description=?,location=?,rpgid=? WHERE id=?");
  let info = expr.run(time,name,description,location,rpgid,sessionid);
  console.log(info);
}

function deleteSession(id) {
  let expr = db.prepare("DELETE FROM Sessions WHERE id=?");
  let info = expr.run(id);
  console.log(info);
}

function getTranscriptAnalysis(transcript) {
  let fileContent = fs.readFileSync("www/files/" + transcript).toString();
  let analysis = Math.floor(analyzeGradeLevel(fileContent));
  return analysis;
}

function addTranscript(sessionid, transcript) {
  let expr = db.prepare("UPDATE Sessions SET transcript = ? WHERE id=?");
  let info = expr.run(transcript, sessionid);
  console.log(info);
}

function findSession(id) {
  let expr = db.prepare("SELECT * FROM Sessions WHERE id=?");
  let session = expr.all(id);
  let name = [];
  session = session[0];

  expr = db.prepare(
    "SELECT *,Groups.name FROM Sessions INNER JOIN Groups ON Sessions.groupid = Groups.id INNER JOIN RPG ON Sessions.rpgid = RPG.id WHERE Groups.id=?"
  );

  name = expr.all(session.groupid);
  name = name[0].name;

  sessionName = db.prepare("SELECT name FROM Sessions WHERE id=?").get(id);
  if (session.transcript) {
    //load transcript text here
    session.languageLevel = getTranscriptAnalysis(session.transcript);
  }
  console.log(`Found name: ${sessionName}`);
  session.sessionName = sessionName.name;
  console.log(session);
  return session;
}

function searchByNameorGroupName(searchValue) {
  const query = `SELECT G.name AS groupName, 
  (U.firstname || ' ' || U.lastname) AS ownerName, S.*, RPG.name 
FROM Sessions S 
JOIN Groups G ON S.groupid = G.id 
JOIN RPG ON S.rpgid = RPG.id 
JOIN Users U ON U.id = G.owner 
WHERE G.name LIKE ? OR (U.firstname || ' ' || U.lastname) LIKE ?;`;
  let expr = db.prepare(query);
  let results = expr.all("%" + searchValue + "%", "%" + searchValue + "%");
  let finalData = results.map((session) => {
    session.languageLevel = session.transcript
      ? getTranscriptAnalysis(session.transcript)
      : 0;
    return session;
  });
  return finalData;
}

function getSessions() {
  const query = `SELECT G.name AS groupName, (U.firstname || ' ' || U.lastname) AS ownerName, S.*, RPG.name 
  FROM Sessions S JOIN Groups G ON S.groupid = G.id JOIN RPG ON S.rpgid=RPG.id JOIN Users U ON U.id = G.owner;`;

  const results = db.prepare(query).all();
  let sessions = results.map((session) => {
    session.languageLevel = session.transcript
      ? getTranscriptAnalysis(session.transcript)
      : 0;
    return session;
  });

  return sessions;
}

function allGroupSessions(groupId) {
  let expr = db.prepare("SELECT Sessions.id,Sessions.groupid,Sessions.time,RPG.name,RPG.edition,Sessions.transcript,Sessions.location,Sessions.name,Sessions.description FROM Sessions INNER JOIN RPG ON rpgid=RPG.id WHERE groupid=? ORDER BY time");
  let results = expr.all(groupId);
  return results;
}
function allRPGS() {
  let rows = db.prepare("SELECT * FROM RPG").all();
  return rows;
}

module.exports = {
  searchByNameorGroupName,
  getSessions,
  createSession,
  findSession,
  allGroupSessions,
  addTranscript,
  groupSessionLevels,
  getGradeLevel,
  getTranscriptAnalysis,
  deleteSession,
  allRPGS,
  round,
  getAverageSessionLevel,
  getUserAverage,
  updateSession
};
