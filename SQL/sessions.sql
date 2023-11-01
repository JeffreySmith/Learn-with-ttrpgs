CREATE TABLE IF NOT EXISTS Sessions(
       id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
       groupid INTEGER,
       time DATETIME NOT NULL,
       transcript VARCHAR(100),
       FOREIGN KEY(groupid) REFERENCES Groups(id)
);
