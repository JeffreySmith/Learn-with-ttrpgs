CREATE TABLE IF NOT EXISTS Users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(51) NOT NULL,
       email VARCHAR(50) NOT NULL UNIQUE,
       password VARCHAR(50) NOT NULL
);
INSERT OR REPLACE INTO Users (Name,Email,Password) VALUES(
       "Bobby",
       "bob@gmail.com",
       "12345"
);
INSERT OR REPLACE INTO Users (Name,Email,Password) VALUES(
       "Jane",
       "jaoy@hotmail.com",
       "98543"
);
