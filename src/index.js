"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto = __importStar(require("crypto"));
const express_session_1 = __importDefault(require("express-session"));
const bcrypt = __importStar(require("bcrypt"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path = __importStar(require("path"));
const hello_1 = require("./hello");
const port = 8000;
const db_string = "SQL/testDB.db";
const my_session = {
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: true
};
(0, hello_1.hello)("Jeffrey");
const app = (0, express_1.default)();
app.use((0, express_session_1.default)(my_session));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "www/views"));
app.use(express_1.default.static(__dirname + "/www"));
;
;
function getGroups() {
    const db = new better_sqlite3_1.default(db_string);
    let groups = [];
    const rows = db.prepare("SELECT * FROM Groups").all();
    for (let row of rows) {
        console.log(row);
        groups.push(row);
    }
    db.close();
    return groups;
}
function insertGroup(owner, groupName) {
    let group = {
        id: null,
        name: groupName,
        owner: owner,
    };
    const db = new better_sqlite3_1.default(db_string);
    let expr = db.prepare("INSERT INTO Groups (name,owner) VALUES(?,?)");
    let info = expr.run(group.name, owner.id);
    db.close();
    console.log(info);
}
function deleteGroup(group) {
    const db = new better_sqlite3_1.default(db_string);
    let expr = db.prepare("DELETE FROM Groups WHERE id=?");
    let info = expr.run(group.id);
    console.log(info);
    db.close();
}
function convertUser(user) {
    let new_user = {
        name: user.name,
        email: user.email,
        id: user.id
    };
    return new_user;
}
function argCount(args, body) {
    let arg_count = 0;
    for (let _ in body) {
        arg_count += 1;
    }
    if (arg_count === args) {
        return true;
    }
    return false;
}
function getUsers() {
    const db = new better_sqlite3_1.default(db_string);
    let users = [];
    const rows = db.prepare("SELECT * FROM Users").all();
    for (let row of rows) {
        users.push(row);
    }
    db.close();
    return users;
}
function findUser(user) {
    let users = getUsers();
    for (let u of users) {
        if (u.email === user.email) {
            return u;
        }
    }
    return null;
}
// This function hashes the user's password before saving things to the db
function insert_user(user) {
    let result = false;
    const db = new better_sqlite3_1.default(db_string, { verbose: console.log, fileMustExist: true });
    bcrypt
        .hash(user.password, 10)
        .then(hash => {
        let expr = db.prepare("INSERT INTO Users (name,password,email) VALUES(?,?,?)");
        let info = expr.run(user.name, hash, user.email);
        console.log(info);
        console.log(hash);
        db.close();
    })
        .catch(err => console.error(err.message));
}
app.get("/ejs", (_req, res) => {
    res.render('index');
});
app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/account", (req, res) => {
    //res.render("account",);
});
app.post("/login", (req, res) => {
    const users = getUsers();
    const email = req.body.email;
    const password = req.body.password;
    const user = users.find((user) => user.email === email);
    if (!user) {
        console.log("User not found");
        return res.render("login");
    }
    bcrypt.compare(password, user.password)
        .then((result) => {
        if (result) {
            req.session.loggedIn = true;
            req.session.username = user.email;
            req.session.role = "user";
            console.log("User login correct");
            res.render("login");
        }
        else {
            console.log("Password is wrong");
            res.render("login");
        }
    })
        .catch((err) => {
        console.error(`Error with bcrypt: ${err}`);
        res.render("login");
    });
});
app.post("/register", (req, res) => {
    let new_user = {
        id: null,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    };
    //doesn't exist yet
    res.redirect("/account");
});
app.get("/", (_req, res) => {
    res.send("Hello there!");
});
app.get("/user", (_req, res) => {
    const users = getUsers();
    let users_nopwd = users.map(u => convertUser(u));
    res.json(users_nopwd);
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.post("/user", (req, res) => {
    const num_args = 3;
    if (!argCount(num_args, req.body)) {
        res.status(400).send("Incorrect format");
    }
    let new_user = {
        id: null,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };
    try {
        let result = insert_user(new_user);
        res.status(200).send(`User ${new_user.email} created!`);
    }
    catch (err) {
        res.status(401).send(`Error: ${err}`);
    }
});
app.get("/check", (req, res) => {
    if (req.session.username) {
        res.send(`Your username is: ${req.session.username}`);
    }
    else {
        res.send(`No available session?`);
    }
});
//First argument to post: username?
app.post("/group", (req, res) => {
    let foundUser = false;
    if (!argCount(2, req.body)) {
        res.status(400).send("Incorrect format");
    }
    let users = getUsers();
    for (let user of users) {
        if (user.email === req.body.username) {
            foundUser = true;
            try {
                insertGroup(user, req.body.name);
                res.status(200).send(`Successfully created group ${req.body.name}`);
            }
            catch (err) {
                res.status(401).send(`Error: ${err}`);
            }
        }
    }
    if (!foundUser) {
        res.status(401).send(`User ${req.body.username} was not found`);
    }
});
app.post("/login", (err, req, res) => {
    console.log(`Error: ${err}`);
    if (!argCount(2, req.body)) {
        res.status(400).send("Incorrect format");
    }
    let users = getUsers();
    users.map(u => console.log(u));
    for (let user of users) {
        if (req.body.username === user.email) {
            bcrypt
                .compare(req.body.password, user.password)
                .then(result => {
                console.log(`Password matches: ${result}`);
                if (result) {
                    req.session.loggedIn = true;
                    req.session.username = user.email;
                    res.status(200).send(`Succesfully logged in as ${req.session.username}`);
                }
                else {
                    res.status(401).send(`Failed to find user`);
                }
            })
                .catch(err => {
                console.error(err.message);
                res.status(401).send(`${err.message}`);
            });
        }
    }
});
app.post("/deletegroup", (req, res) => {
    let groups = getGroups();
    if (!argCount(1, req.body)) {
        res.status(400).send("Incorrect format");
    }
    for (let group of groups) {
        console.log(group.name);
        if (group.name === req.body.groupname) {
            deleteGroup(group);
            console.log(`Deleted group ${group.name}`);
            break;
        }
    }
    res.status(200).send("Deleted");
});
app.listen(port, () => {
    console.log(`Running server on port ${port}`);
});
