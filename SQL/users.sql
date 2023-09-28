CREATE TABLE IF NOT EXISTS Users (
       ID INTEGER PRIMARY KEY,
       Name VARCHAR(50) NOT NULL,
       Email VARCHAR(50) NOT NULL UNIQUE,
       Password VARCHAR(50) NOT NULL
);
INSERT OR REPLACE INTO Users(ID,Name,Email,Password) VALUES(
       1,
       "Bobby",
       "bob@gmail.com",
       "12345"
);
INSERT OR REPLACE INTO Users (ID,Name,Email,Password) VALUES(
       2,
       "Jane",
       "jaoy@hotmail.com",
       "98543"
);
