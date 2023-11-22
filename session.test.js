global.db_string="SQL/testDB.db";
const session = require('./src/session.js');

test("Test grade calculation of testtranscript.txt",()=>{
  expect(session.getTranscriptAnalysis("testtranscript.txt")).toBe(2);
});
test("Test grade calculation of testtranscript2.txt",()=>{
  expect(session.getTranscriptAnalysis("testtranscript2.txt")).toBe(7);
});
test("Test SQL injection",()=>{
  expect(()=>session.findSession("2 or 1=1")).toThrow(TypeError);
});
test("Rounding function works correctly",()=>{
  expect(session.round(1.26)).toBe(1.25);
});

