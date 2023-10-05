CREATE TABLE IF NOT EXISTS Groups(
       id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(50) NOT NULL UNIQUE,
       owner INT NOT NULL,
       FOREIGN KEY(owner) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Sessions(
       id INT NOT NULL PRIMARY KEY,
       groupid INTEGER,
       time DATETIME NOT NULL,
       FOREIGN KEY(groupid) REFERENCES Groups(id)
);       

       
