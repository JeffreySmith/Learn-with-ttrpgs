PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS RPG(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) NOT NULL,
        publisher VARCHAR(50) NOT NULL,
        minplayers INTEGER NOT NULL DEFAULT 2,
        maxplayers INTEGER NOT NULL DEFAULT 8,
        edition VARCHAR(25),
        UNIQUE(name,edition)
);
INSERT OR IGNORE INTO RPG(id,name,publisher,edition) VALUES
(
        1,
        "Dungeons & Dragons",
        "Wizards of the Coast",
        "5th Edition"
);
INSERT OR IGNORE INTO RPG(id,name,publisher,edition) VALUES
(
        2,
        "Vampire the Masquerade",
        "White Wolf",
        "5th Edition"
);
INSERT OR IGNORE INTO RPG(id,name,publisher,edition) VALUES
(
        3,
        "Shadowrun",
        "Catalyst Game Lab",
        "6th Edition"
);
