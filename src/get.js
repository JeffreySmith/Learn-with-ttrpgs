const express = require("express");
const router = express.Router();
const {
  findUserSafe,
  rateUser,
  getUsers,
  getUserById,
  getRatings,
} = require("./user.js");
const {
  getGroups,
  findGroup,
  getGroupById,
  getGroupMembers,
  isInGroup,
  getGroupsByName,
  isGroupAdmin
} = require("./groups.js");

const {
  getSessions,
  searchByNameorGroupName,
  createSession,
  deleteSession,
  findSession,
  allGroupSessions,
  groupSessionLevels,
  getGradeLevel,
  allRPGS,
  getUserAverage
} = require("./session.js");

const db = require("better-sqlite3")(global.db_string);
db.pragma("foreign_keys=ON");

router
  .get("/", (req, res) => {
    if(!req.session.username){
      res.render("home");
    }
    else{
      res.redirect("/dashboard");
    }
  })
  .get("/about",(req,res)=>{
    res.render("about");
  })

  .get("/search-data", (req, res) => {
    let searchValue = req.query.search;
    let result = searchByNameorGroupName(searchValue);
    // let fake = [ {
    // groupName: 'Heroes of the Abyss',
    //   ownerName: 'Amelia Miller',
    //   id: 2,
    //   name: 'Shadowrun',
    //   rpgid: 2,
    //   groupid: 2,
    //   description: 'We are going to learn a few things in the library this week',
    //   time: '2023-11-25 16:45:00',
    //   transcript: null,
    //   location: 'The library',
    //   languageLevel:2
    // }, {
    //   groupName: 'Heroes of the Abyss',
    //   ownerName: 'Amelia Miller',
    //   id: 2,
    //   name: 'Vampire the Masquerade',
    //   rpgid: 2,
    //   groupid: 2,
    //   description: 'We are going to learn a few things in the library this week',
    //   time: '2023-11-25 16:45:00',
    //   transcript: null,
    //   languageLevel:1,
    //   location: 'Online'
    // }]
    res.json(result);
  })

  .get("/search", (req, res) => {
    let groups = getGroups();
    res.render("searchPage",{groups:groups});
  })

  .get("/register", (req, res) => {
    if (!req.session.username) {
      res.render("registration");
    } else {
      res.redirect("/userprofile");
    }
  })
  .get("/login", (req, res) => {
    if (!req.session.username) {
      res.render("login");
    } else {
      res.redirect("/dashboard");
    }
  })
  .get("/logout", (req, res) => {
    if (req.session.username) {
      req.session.username = undefined;
      req.session.role = undefined;
      req.session.loggedIn = undefined;
    } else {
      console.log("Trying to logout despite not being logged in...");
    }
    res.redirect("/");
  })
  .get("/recovery", (req, res) => {
    res.render("recovery");
  })

  .get("/groups-data", (req, res) => {
    let query = req.query.query;
    const groups = getGroupsByName(query);
    res.json(groups);
  })


  .get("/recover/:id/:email/",(req,res)=>{

    let id = req.params.id;
    let validRequest = global.resetUUIDS.find((u) => u.uuid === id);
    let index = undefined;

    let user = undefined;
    if(validRequest){
      user = findUserSafe(validRequest.email);
    }
    if(validRequest){
      index = global.resetUUIDS.findIndex(u=>u.uuid === id);
    }
    else{
      res.status(400).send("Invalid link");
    }
    console.log(validRequest);
    console.log("Index is: " + index);
    if (validRequest && Date.now() - validRequest.time <= 900000) {
      console.log("Allow password resetting");
      console.log(Date.now() - validRequest.time);
      //global.resetUUIDS = global.resetUUIDS.filter(u=>u.uuid !== id);

      res.render("newpassword",{user:user,email:req.params.email});
    }
    else{

      console.log("Password reset not valid");
      global.resetUUIDS = global.resetUUIDS.filter((u) => u.uuid !== id);
      res.status(401).send("Link not valid");
    }
  })

  .get("/changeuserpassword",(req,res)=>{
    if(req.session.username){
      let user = findUserSafe(req.session.username);
      res.render("newpassword",{user:user,email:req.session.username});
    }
    else{
      res.redirect("/userprofile");
    }
  })
  
  .get("/group/:id/",(req,res)=>{
    let groupid = undefined;
    let isAdmin = false;
    let username = req.session.username;
    if (req.params.id) {
      groupid = req.params.id;
    }
    if (req.session.username == undefined) {
      //username = "ttrpglearning@gmail.com";
      req.session.previousPage = `/group/${req.params.id}/`;
      return res.redirect("/login");
    }

    console.log(req.body.username);

    if (groupid) {
      let group = getGroupById(groupid);
      let sessionLevels = groupSessionLevels(groupid);
      let numOfSessions = allGroupSessions(groupid).length;
      if(group){
	let members = getGroupMembers(group.name);

	console.log(members);
	let inGroup = false;
	for(let member of members){
	  if (req.session.username == member.email){
	    inGroup = true;
	  }
	}
	let admin = getUserById(group.owner);
	let user = findUserSafe(req.session.username);
	

	if(isGroupAdmin(user.email,group.name)){
	  console.log(`User ${user.name} is the admin for ${group.name}`);
	  isAdmin = true;
	}



	res.render("leavegroup",{members:members,group:group,username:username,sessioninfo:sessionLevels,admin:admin,id:req.params.id,isAdmin:isAdmin,inGroup:inGroup,numOfSessions:numOfSessions});


      }
    } else {
      res.redirect("/group");
    }
  })
  .get("/group", (req, res) => {
    let groups = getGroups();
    if (req.session.username) {
      let username = req.session.username;

      res.render("joincreate",{groups:groups,username:username});
    }
    else{
      req.session.previousPage = "/group";
      res.redirect("/login");
    }
  })
  .get("/userprofile/:id/", (req, res) => {
    let user = getUserById(req.params.id);

    if (user) {
      let ratings = getRatings(user.email);
      if (req.session.username) {
        let loggedIn = findUserSafe(req.session.username);
        if (loggedIn != user) {
          res.render("publicprofile", {
            user: user,
            ratings: ratings,
            loggedInUser: loggedIn,
          });
        } else {
          res.render("publicprofile", { user: user, ratings: ratings });
        }
      } else {
        res.render("publicprofile", { user: user, ratings: ratings });
      }
    } else {
      res.redirect("/userprofile");
    }
  })
  .get("/userprofile", (req, res) => {
    if (req.session.username) {
      console.log(getRatings(req.session.username));
      let user = getUsers().find((user) => user.email === req.session.username);
      let ratings = getRatings(user.email);

      res.render("publicprofile",{user:user,ratings:ratings,userPage:true});
    }
    else{
      res.redirect("/login");
    }
  })

  .get("/sessioninfo/:groupid/", (req, res) => {
    console.log("Trying to get resource...");
    res.set("Access-Control-Allow-Origin", "*");
    let sessions = allGroupSessions(req.params.groupid);
    console.log(sessions);
    let sessionInfo = [];
    for (let session of sessions) {
      if (session.transcript) {
        let info = {
          id: session.id,
          level: getGradeLevel(session.id),
          time: session.time.substring(0, 10).replaceAll("-", "/"),
        };
        sessionInfo.push(info);
      }
    }
    res.json(sessionInfo);
  })
  .get("/session", (req, res) => {
    let sessions = getSessions();
    if (sessions.length > 0) {
      res.render("sessionsList", { sessionList: sessions });
    }
  })
  .get("/sessioninfo", (req, res) => {
    res.status(401).send("Bad request");
  })

/*  .get("/groups",(req,res)=>{
    const groups = getGroups();
    res.render("groups",{groups:groups});
  })*/
  .get("/createsession/:sessionid?/",(req,res)=>{
    let groups = getGroups();
    
    const rpgs = allRPGS();
    if (!req.session.username) {

      if(!req.params.sessionid){
	req.session.previousPage = `/createsession`;
      }
      else{



	req.session.previousPage = `/createsession/${req.params.sessionid}`;
      }
      return res.redirect("/login");
    }
    let user = findUserSafe(req.session.username);

    
    if (!req.params.sessionid) {
      
      if(groups.length==0){
	return res.redirect(`/group`);
      }
      else{
	res.render("createSessions", { groups: groups, rpgs: rpgs });
      }
    }
    else {
      const session = findSession(req.params.sessionid);
      groups = groups.filter((group)=> group.id==session.groupid);


      if (!session || groups.length==0) {
        return res.redirect(`/sessions/${req.params.sessionid}`);
      }
      else if(session && groups.length==0){
	return res.redirect(`/group/${session.groupid}`);
      }
      else{
	res.render("createSessions", {
          groups: groups,
          rpgs: rpgs,
          session: session,
	});
      }
    }
  })
  .get("/sessions/:groupid/", (req, res) => {
    let user = "";
    let userInGroup = false;
    
    if(!req.session.username){
      req.session.previousPage=`/sessions/${req.params.groupid}`;
      res.redirect("/login");
      
    }
    else{
      user = findUserSafe(req.session.username);
    }
      
    

    let sessions = allGroupSessions(req.params.groupid);
    let group = getGroupById(req.params.groupid);
    let name = "";
    if (typeof group.name != undefined) {
      name = group.name;
    }

    let result = db.prepare("SELECT * FROM GroupMembers WHERE groupid=? AND userid=?").get(group.id,user.id);
    if(result){
      userInGroup = true;
    }
    
    console.log(`Name: ${name}`);
    for (let session of sessions) {
      session.date = session.time.substring(0, 10);
      session.onlyTime = session.time.substring(11, 16);
    }

   
      console.log(sessions);
      res.render("sessionsPage", { sessions: sessions, name: name,userInGroup:userInGroup,group:group });
    
  })
  .get("/deletesession/:groupid/:sessionid/", (req, res) => {
    if (!req.session.username) {
      req.session.previousPage = `/sessions/${req.params.groupid}/`;
      res.redirect("/login");
    }
    let user = findUserSafe(req.session.username);
    let group = getGroupById(req.params.groupid);
    console.log("GROUP:");
    console.log(group);
    //Basically, you have to be logged in as well as a member of the group to delete something


    if(user && isGroupAdmin(user.email,group.name)){      

      deleteSession(req.params.sessionid);
      console.log("Session deleted!");
      res.redirect(`/sessions/${req.params.groupid}`);
    } else {
      console.log("Not deleting session??");
      res.redirect(`/sessions/${req.params.groupid}`);
    }
  })
  .get("/sendmessage", (req, res) => {
    if (req.session.username) {
      let user = findUserSafe(req.session.username);
      let users = getUsers();
      res.render("message", { user: user, users: users });
    } else {
      req.session.previousPage = "/sendmessage";
      res.redirect("/login");
    }
  })
  .get("/feedback/:id/", (req, res) => {
    if (req.session.username) {
      let groupName = getGroupById(req.params.id).name;
      let members = getGroupMembers(groupName);
      let id = req.params.id;
      let user = findUserSafe(req.session.username);
      console.log(members);
      res.render("feedback", { members: members, id: id,user:user });
    } else {
      req.session.previousPage = `/feedback/${req.params.id}`;
      res.redirect("/login");
    }
  })


  .get("/passwordrecoverysent/",(req,res)=>{
    let email = req.session.recoveryemail;
    if(email){
      req.session.recoveryemail = undefined;
      res.render("passordrecoverysent",{email:email});
      
    }
    else{
      res.redirect("/recovery");
    }
  })

  .get("/dashboard",(req,res)=>{
    if(req.session.username){
      let user = findUserSafe(req.session.username);
      let level = getUserAverage(user.id);
      let groups = getGroups();
      let sessions = [];
      let nextSession = "3000-10-25 16:30:00";
      let sessionToSend = undefined;
      groups = groups.filter((group)=>{
	let expr = db.prepare("SELECT * FROM GroupMembers WHERE userid=? AND groupid=?").get(user.id,group.id);
	console.log(expr);
	if(expr!=undefined){
	  let session = db.prepare("SELECT * FROM Sessions WHERE time>=datetime('now') AND groupid=? ORDER BY TIME LIMIT 1").get(group.id);
	  if(session){
	    sessions.push(session)
	  }
	  
	  return expr;
	}
	
      });
      for (let session of sessions){
	let newDate = new Date(session.time);
	if (newDate <= new Date(nextSession)){
	  nextSession = session.time;
	}
      }
      sessionToSend = sessions.filter((s)=> s.time==nextSession);
      let groupName = "";
      if(sessionToSend.length>0){
	groupName = db.prepare('SELECT Groups.name,Groups.id FROM Groups JOIN Sessions ON Sessions.groupid = Groups.id WHERE Sessions.id = ?').get(sessionToSend[0].id);
      }
      console.log(sessionToSend);
      console.log(sessions);
      res.render("userLandingPage",{username:req.session.username,level:level,groups:groups,nextSession:nextSession,sessionToShow:sessionToSend[0],groupName:groupName});
      
    }
    else{
      req.session.previousPage="/dashboard";
      res.redirect("/login");
    }
  })

module.exports = router;
