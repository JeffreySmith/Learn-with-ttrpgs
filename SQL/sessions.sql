CREATE TABLE IF NOT EXISTS Sessions(
       id INTEGER NOT NULL PRIMARY KEY,
       groupid INTEGER,
       time DATETIME NOT NULL,
       transcript VARCHAR(100),
       recordingtime INTEGER,
       FOREIGN KEY(groupid) REFERENCES Groups(id)
);
