CREATE TABLE IF NOT EXISTS GroupSessions
(
        groupid INTEGER NOT NULL,
        sessionid INTEGER NOT NULL,
        FOREIGN KEY(groupid) REFERENCES Groups(id),
        FOREIGN KEY(sessionid) REFERENCES Sessions(id),
        PRIMARY KEY (groupid,sessionid)
);
CREATE TABLE IF NOT EXISTS GroupMembers
(
        userid INTEGER NOT NULL,
        groupid INTEGER NOT NULL,
        FOREIGN KEY(userid) REFERENCES Users(id),
        FOREIGN KEY(groupid) REFERENCES Groups(id),
        PRIMARY KEY (userid,groupid)
);
