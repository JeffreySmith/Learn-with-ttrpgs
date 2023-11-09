PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS Sessions(
       id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
       rpgid INTEGER,
       groupid INTEGER,
       time DATETIME NOT NULL,
       transcript VARCHAR(100),
       FOREIGN KEY(groupid) REFERENCES Groups(id),
       FOREIGN KEY(rpgid) REFERENCES RPG(id)
);

INSERT OR IGNORE INTO Sessions(id,rpgid,groupid,time,transcript) VALUES
(
       1,
       1,
       1,
       "2023-12-16 18:30:00",
       "testtranscript.txt"
);
