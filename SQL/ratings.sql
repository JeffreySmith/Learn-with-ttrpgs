PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS UserRatings
(
        raterid INTEGER NOT NULL,
        targetid INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment VARCHAR(200),
        FOREIGN KEY(raterid) REFERENCES Users(id),
        FOREIGN KEY(targetid) REFERENCES Users(id),
        PRIMARY KEY (raterid,targetid),
        UNIQUE (raterid,targetid),
        CHECK(rating<=5 AND rating>0),
        CHECK(raterid <> targetid)
);
INSERT OR IGNORE INTO UserRatings (raterid,targetid,rating,comment) VALUES
(
        1,
        2,
        5,
        "Had a great time with them."
)
