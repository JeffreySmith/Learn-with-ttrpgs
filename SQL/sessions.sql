CREATE TABLE IF NOT EXISTS Sessions(
       id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
       rpgid INTEGER,
       groupid INTEGER,
       time DATETIME NOT NULL,
       transcript VARCHAR(100),
       FOREIGN KEY(groupid) REFERENCES Groups(id),
       FOREIGN KEY(rpgid) REFERENCES RPG(id)
);
