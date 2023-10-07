CREATE TABLE IF NOT EXISTS Messages(
       id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
       sender INTEGER NOT NULL,
       receiver INTEGER NOT NULL,
       content VARCHAR(300),
       time DATETIME NOT NULL DEFAULT current_timestamp
);
       
