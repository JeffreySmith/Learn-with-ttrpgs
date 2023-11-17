PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS Users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       firstname VARCHAR(50) NOT NULL,
       lastname VARCHAR(50) NOT NULL,
       email VARCHAR(50) NOT NULL UNIQUE,
       password VARCHAR(50) NOT NULL,
       joined DATE,
       role VARCHAR(5) NOT NULL
);
INSERT OR IGNORE INTO Users(id,firstname,lastname,email,password,joined,role) VALUES
(
        1,
        "Jeffrey",
        "Smith",
        "ttrpglearning@gmail.com",
        "$2b$10$/1pWVJBroVrRH4wDEF4gMuBBkf0SmlFqSuDMZpAr6tYP.HsaNQmcq", -- This is '123456'
        "2023-11-05",
        "admin"
);
INSERT OR IGNORE INTO Users(id,firstname,lastname,email,password,joined,role) VALUES
(
        2,
        "Amelia",
        "Miller",
        "ttrpglearning+amelia@gmail.com",
        "$2b$10$lQ0FNh6.Ct1ZMqaEwGHNdu.HUqgkGRCbEvbyxl4hNamqSkTrVa3Ru", -- This is '123456'
        "2023-11-06",
        "user"
);
INSERT INTO Users(id,firstname,lastname,email,password,joined,role) VALUES
(
        3,
        "Patrick",
        "McCloud",
        "ttrpglearning+winston@gmail.com",
        "$2b$10$lQ0FNh6.Ct1ZMqaEwGHNdu.HUqgkGRCbEvbyxl4hNamqSkTrVa3Ru", --123456
        "2023-11-07",
        "user"
);

