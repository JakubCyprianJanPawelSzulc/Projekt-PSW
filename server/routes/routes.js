const express = require("express");
const routes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;


routes.route("/register").post(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myobj = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        wins: 0,
        losses: 0,
        games_played: 0,
    };
    db_connect.collection("users").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
    }
    );
    res.json({ message: "User added successfully" });
});



routes.route("/login").post(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myobj = {
        username: req.body.username,
        password: req.body.password,
    };
    db_connect.collection("users").findOne(myobj, function (err, result) {
        if (err) throw err;
        res.json(result);
    }
    );
});



routes.route("/api/user/:id").get(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect.collection("users").findOne
        (myquery, function (err, result) {
            if (err) throw err;
            res.json(result);
        }
        );
});



routes.route("/api/user/:id").put(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
        $set: {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
        }
    };
    db_connect.collection("users").updateOne
        (myquery, newvalues, function (err, result) {
            if (err) throw err;
            res.json(result);
        }
        );
});



routes.route("/api/user/:id").delete(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect.collection("users").deleteOne
        (myquery, function (err, result) {
            if (err) throw err;
            res.json(result);
        }
        );
});


routes.route("/api/user/search/:username").get(function (req, res){
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { username: { $regex: req.params.username } };
    db_connect.collection("users").
    find(myquery).toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
    }
    );
});

// routes.route("/api/user/search/:username").get(function (req, res) {
//     let db_connect = dbo.getDb("myDatabase");
//     let myquery = { username: req.params.username };
//     db_connect.collection("users").findOne
//         (myquery, function (err, result) {
//             if (err) throw err;
//             res.json(result);
//         }
//         );
// });


module.exports = routes;



