PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS Sessions(
       id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(100),
       rpgid INTEGER,
       groupid INTEGER,
       time DATETIME NOT NULL,
       transcript VARCHAR(100),
       location VARCHAR(100),
       FOREIGN KEY(groupid) REFERENCES Groups(id),
       FOREIGN KEY(rpgid) REFERENCES RPG(id)
);

INSERT OR IGNORE INTO Sessions(id,name,rpgid,groupid,time,transcript,location) VALUES
(

       1,
       "First Session",  
       1,
       1,
       "2023-12-16 18:30:00",
       "testtranscript.txt",
       "A17, Conestoga College, Guelph Campus"
);
INSERT OR IGNORE INTO Sessions(id,name,rpgid,groupid,time,location) VALUES
(
        2,
        "Second Test Session",
        1,
        2,
        "2023-11-25 16:45:00",
        "The library"
);
INSERT OR IGNORE INTO Sessions(id,name,rpgid,groupid,time,transcript,location) VALUES
(
        3,
        "Third Test Session",
        1,
        1,
        "2023-11-16 12:30:00",
        "testtranscript2.txt",
        "Online"
);
