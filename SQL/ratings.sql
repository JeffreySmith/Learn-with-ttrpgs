PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS UserRatings
(
        raterid INTEGER NOT NULL,
        targetid INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        FOREIGN KEY(raterid) REFERENCES Users(id),
        FOREIGN KEY(targetid) REFERENCES Users(id),
        PRIMARY KEY (raterid,targetid),
        UNIQUE (raterid,targetid),
        CHECK(rating<=5 AND rating>0),
        CHECK(raterid <> targetid)
);
INSERT OR IGNORE INTO UserRatings (raterid,targetid,rating) VALUES
(
        7,
        4,
        4
)
