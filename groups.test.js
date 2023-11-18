global.db_string="SQL/testDB.db";
const Group = require("./src/groups.js");

test("Test SQL injection",()=>{
  expect( Group.getGroupById("2 OR 1=1") == undefined).toBe(true);
});
