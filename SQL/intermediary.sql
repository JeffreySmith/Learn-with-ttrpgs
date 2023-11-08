PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS GroupMembers
(
        userid INTEGER NOT NULL,
        groupid INTEGER NOT NULL,
        FOREIGN KEY(userid) REFERENCES Users(id),
        FOREIGN KEY(groupid) REFERENCES Groups(id),
        PRIMARY KEY (userid,groupid)
);

