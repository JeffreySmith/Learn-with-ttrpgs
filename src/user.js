const bcrypt = require("bcrypt");

const db = require("better-sqlite3")(global.db_string);

db.pragma("foreign_key=ON");

function insertUser(name, lastName, email, password, role) {
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      let expr = db.prepare(
        "INSERT INTO Users (firstname,lastname,password,email,role) VALUES(?,?,?,?,?)"
      );
      let info = expr.run(name, lastName, hash, email, role);
      console.log(info);
    })
    .catch((err) => console.error(err.message));
}

//If you don't need to get the user's password, this is the function you should use
function findUserSafe(email) {
  let expr = db.prepare(
    "SELECT id,firstname,lastname,email From Users WHERE email=?"
  );
  let info = expr.get(email);
  return info;
}
function rateUser(targetUserEmail, userEmail, rating, comment) {
  let target = findUserSafe(targetUserEmail);
  let rater = findUserSafe(userEmail);

  let expr = "";

  if (target && rater && rating && target.id !== rater.id) {
    try {
      //console.log("Creating a rating for "+user.email);
      expr = db.prepare(
        "INSERT INTO UserRatings (rating,raterid,targetid,comment) VALUES(?,?,?,?)"
      );
      let info = expr.run(rating, rater.id, target.id, comment);
      console.log(info);
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  } else {
    console.log(
      `Info: target user: ${target}, rater: ${rater}, rating: ${rating}`
    );
  }
}
function updateRating(targetUserEmail, userEmail, newRating, comment) {
  let target = findUserSafe(targetUserEmail);
  let rater = findUserSafe(userEmail);

  if (target && rater && newRating && target.id !== rater.id) {
    try {
      let expr = db.prepare(
        "UPDATE UserRatings SET rating = ?, comment = ? WHERE raterid=? AND targetid=?"
      );
      let info = expr.run(newRating, comment, rater.id, target.id);
      console.log(info);
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  }
}
function getRatings(userEmail) {
  let user = findUserSafe(userEmail);
  let rows = db
    .prepare("SELECT * FROM UserRatings WHERE targetid=?")
    .all(user.id);
  console.log(rows);
  return rows;
}

function getUsers() {
  return db.prepare("SELECT * FROM Users").all();
}

function getUserById(id) {
  return db.prepare("SELECT * FROM Users WHERE id=?").get(id);
}

module.exports = {
  insertUser,
  findUserSafe,
  rateUser,
  getUsers,
  getUserById,
  getRatings,
  updateRating,
  getUsers,
};
