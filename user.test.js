global.db_string="SQL/testDB.db";
const User = require('./src/user.js');

test("Check that the user search works",()=>{
  let email = "ttrpglearning@gmail.com";
  let user = User.findUserSafe(email);
  expect(user.email).toEqual(email);
})
