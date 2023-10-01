CREATE TABLE IF NOT EXISTS Groups(
       ID INT NOT NULL PRIMARY KEY AUTOINCREMENT,
       Name VARCHAR(50) NOT NULL,
       Owner INT NOT NULL,
       FOREIGN KEY(Owner) REFERENCES Users(ID)
);

INSERT OR REPLACE INTO Groups (Name,Owner)VALUES(

       "The Order of the Dice",
       1
);
INSERT OR REPLACE INTO Groups VALUES(

       "The Roll Initiative Squad",
       2
);

CREATE TABLE IF NOT EXISTS Sessions(
       ID INT NOT NULL PRIMARY KEY,
       GroupID INTEGER,
       Time DATETIME NOT NULL,
       FOREIGN KEY(GroupID) REFERENCES Groups(ID)
);       
INSERT OR REPLACE INTO Sessions (GroupID,Time) VALUES(
       2,
       "2023-11-06 14:30"
);
       
