PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS Groups(
       id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(50) NOT NULL UNIQUE,
       description VARCHAR(512),
       owner INTEGER NOT NULL,
       FOREIGN KEY(owner) REFERENCES Users(id)
);
INSERT OR IGNORE INTO Groups(id,name,description,owner) VALUES
(
        1,
        "The Order of the Dice",
        "We are a group that is interested in having fun, and including everyone so that we can all improve",
        1

);
INSERT OR IGNORE INTO Groups(id,name,description,owner) VALUES
(
        2,
        "Heroes of the Abyss",
        "Follow the epic journey of 'Heroes of the Abyss'! 🌌 Join our D&D squad for a spellbinding adventure filled with magic, monsters, and camaraderie. Roll with us through dungeons and drama!",
        2

);
INSERT OR IGNORE INTO Groups(id,name,description,owner) VALUES
(
        3,
        "Testing group",
        "We are a group that is interested in having fun, and including everyone so that we can all improve",
        1

);
