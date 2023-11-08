PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS Groups(
       id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(50) NOT NULL UNIQUE,
       description VARCHAR(512),
       owner INTEGER NOT NULL,
       FOREIGN KEY(owner) REFERENCES Users(id)
);
INSERT OR IGNORE INTO Groups(id,name,description,owner) VALUES
(
        1,
        "The Order of the Dice",
        "We are a group that is interested in having fun, and including everyone so that we can all improve",
        7

);

