PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS Users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(50) NOT NULL,
       email VARCHAR(50) NOT NULL UNIQUE,
       password VARCHAR(50) NOT NULL,
       role VARCHAR(5) NOT NULL
);
INSERT OR IGNORE INTO Users(id,name,email,password,role) VALUES
(
        7,
        "Jeffrey",
        "ttrpglearning@gmail.com",
        "$2b$10$NusZTok1TRI78yDkAO441.cA2/4AxsO7fZZ/BuQvuje2TlMKQJTnW",
        "admin"
);

