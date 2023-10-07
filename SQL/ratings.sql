CREATE TABLE IF NOT EXISTS UserRatings(
       id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
       rating INTEGER NOT NULL,
       ratedby INTEGER NOT NULL,
       ratingfor INTEGER NOT NULL,
       FOREIGN KEY (ratedby) REFERENCES Groups(id),
       FOREIGN KEY (ratingfor) REFERENCES Groups(id)
);
