
function createSession(groupName,time,transcript){
  let group = findGroup(undefined,groupName);
  group = group[0];
  let expr = "";
  if(!transcript){
    expr = global.db.prepare("INSERT INTO Sessions (groupid,time) VALUES (?,?)");
    expr.run(group.id,time);
  }
  else if(transcript){
    expr = global.db.prepare("INSERT INTO Sessions (groupid,time,transcript) VALUES (?,?)");
    expr.run(group.id,time,transcript);
  }
}
function findSession(id){
  let expr = global.db.prepare("SELECT * FROM Sessions WHERE id=?");
  let session = expr.all(id);
  session = session[0];

  expr = global.db.prepare("SELECT *,name FROM Sessions INNER JOIN Groups ON Sessions.groupid = Groups.id WHERE Groups.id=?");
  let name = expr.all(session.groupid);
  name = name[0].name;
  console.log(`Found name: ${name}`);
  session.name=name;
  return session;
}
function allGroupSessions(groupId){
  let expr = global.db.prepare("SELECT * FROM Sessions WHERE groupid=?");
  let results = expr.all(groupId);
  return results;
}
module.exports = {createSession,findSession,allGroupSessions};
