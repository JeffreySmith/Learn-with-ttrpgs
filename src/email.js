const { findUserSafe } = require("./user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { getGroupMembers } = require("./groups");

global.resetUUIDS = [];

//This creates the object for
function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });
}
function sendMail(transporter, mailOptions) {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}

function sendJoinRequest(email, groupName) {
  let user = findUserSafe(email);
  if (!user) {
    return undefined;
  }

  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.email,
    to: email, //Address to which you want to send
    subject: "Join Request", //subject
    html: `User ${email} wants to join your group, ${groupName}`,
  };
  sendMail(transporter, mailOptions);
}

function sendMessage(from, to, message) {
  let fromUserEmail = findUserSafe(from).email;
  let toUserEmail = findUserSafe(to).email;

  const mailOptions = {
    from: process.env.email,
    to: toUserEmail,
    subject: `Message from ${fromUserEmail}`,
    html: message,
  };
  sendMail(getTransporter(), mailOptions);
}

function sendPasswordResetEmail(email) {
  if (!findUserSafe(email)) {
    console.log("Email isn't in the db, so we're silently ignoring it");
    return;
  }
  const transporter = getTransporter();
  const uuid = crypto.randomUUID();
  const reset_request = {
    email: email,
    uuid: uuid,
    time: Date.now(),
  };
  //let url = "http://localhost:8000";
  let url = process.env.url;
  if(!url){
    url = "http://localhost:8000";
  }
  global.resetUUIDS.push(reset_request);
  setTimeout(() => {
    global.resetUUIDS = global.resetUUIDS.filter((u) => u != uuid);
  }, 900000);
  if (global.url) {
    url = global.url;
  }
  const mailOptions = {
    from:process.env.email,
    to:email, //Address to which you want to send
    subject:'Password Reset', //subject
    html:`Click <a href="${url}/recover/${uuid}/${email}">here</a> to reset your password` //body of email
  };
  sendMail(transporter, mailOptions);
}
function sendSessionToGroupMembers(text, groupName) {
  const transporter = getTransporter();
  const members = getGroupMembers(groupName);
  for (let member of members) {
    const mailOptions = {
      from: process.env.email,
      to: member.email,
      subject: "New Session Scheduled",
      text: text,
    };
    sendMail(transporter, mailOptions);
  }
}

module.exports = {
  getTransporter,
  sendMail,
  sendPasswordResetEmail,
  sendMessage,
  sendSessionToGroupMembers,
};
