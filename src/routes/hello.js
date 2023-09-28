"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userData = exports.hello = void 0;
function hello(req, res) {
    let name = req.params.name;
    let output = "";
    if (name) {
        output = `Hello, ${name}!`;
    }
    else {
        output = "Hello, World!";
    }
    res.send(output);
}
exports.hello = hello;
function userData(req, res) {
    const input = req.body;
    let output = "";
    console.log(input);
    try {
        output = JSON.stringify(req.body);
        res.status(201).send(output);
    }
    catch (e) {
        res.status(500).send(e.message);
    }
}
exports.userData = userData;
