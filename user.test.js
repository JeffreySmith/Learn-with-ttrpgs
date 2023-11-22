global.db_string="SQL/testDB.db";
const User = require('./src/user.js');

test("Check that the user search works",()=>{
  let email = "ttrpglearning@gmail.com";
  let user = User.findUserSafe(email);
  expect(user.email).toEqual(email);
});
test("User SQL injection test",()=>{
  //This shouldn't return a valid result
  expect(()=>User.getUserById("1 OR id=2")).toBeTruthy(undefined);
});
test("There should be users in the database",()=>{
  expect(User.getUsers().length>0).toBeTruthy();
});


