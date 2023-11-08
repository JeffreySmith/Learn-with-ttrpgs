CREATE TABLE IF NOT EXISTS UserRatings(
       rating INTEGER NOT NULL,
       ratedby INTEGER NOT NULL,
       ratingfor INTEGER NOT NULL,
       FOREIGN KEY (ratedby) REFERENCES Groups(id),
       FOREIGN KEY (ratingfor) REFERENCES Groups(id),
       PRIMARY KEY(ratedby,ratingfor)
);
