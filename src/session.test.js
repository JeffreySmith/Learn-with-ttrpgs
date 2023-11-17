const session = require('./session.js');

test("Test grade calculation of testtranscript.txt",()=>{
  expect(session.getTranscriptAnalysis("testtranscript.txt")).toBe(2)
});
test("Test grade calculation of testtranscript2.txt",()=>{
  expect(session.getTranscriptAnalysis("testtranscript2.txt")).toBe(7)
});
