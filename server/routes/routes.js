const express = require("express");
const routes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

const bcrypt = require("bcrypt");
const saltRounds = 10;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
//   log_stdout.write(util.format(d) + '\n');
};


routes.route("/register").post(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    db_connect.collection("users").findOne({ username: req.body.username }, function (err, result) {
        if (err) throw err;
        if (result) {
            res.json({ message: "Username already exists" });
        } else {
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                let myobj = {
                    username: req.body.username,
                    password: hash,
                    email: req.body.email,
                    wins: 0,
                    losses: 0,
                    games_played: 0,
                };
                db_connect.collection("users").insertOne(myobj, function (err, res) {
                    if (err) throw err;
                    console.log(`user ${myobj.username} added`)
                });
                res.json({ message: "User added successfully" });
            });            
        }
    });
});


routes.route("/login").post(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myobj = {
        username: req.body.username,
    };
    db_connect.collection("users").findOne(myobj, function (err, result) {
        if (err) throw err;
        if (result) {
            bcrypt.compare(req.body.password, result.password, function(err, isMatch) {
                if (isMatch) {
                    console.log(result)
                    res.json(result);
                    console.log(`user ${myobj.username} logged in`)
                } else {
                    res.json({ message: "Incorrect password" });
                }
            });
        } else {
            res.json({ message: "User not found" });
        }
    });
});


routes.route("/api/user/:id").get(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect.collection("users").findOne(myquery, function (err, result) {
            if (err) throw err;
            res.json(result);
            console.log(`get data of user ${result._id}`)
        }
    );
});



routes.route("/api/user/:id").put(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect.collection("users").findOne({ username: req.body.username }, function (err, result) {
        if (err) throw err;
        if (result) {
            res.json({ message: "Username already exists" });
        } else {
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                let newvalues = {
                    $set: {
                    username: req.body.username,
                    password: hash,
                    email: req.body.email,
                    }
                };
                db_connect.collection("users").updateOne(myquery, newvalues, function (err, result) {
                    if (err) throw err;
                    res.json(result);
                    console.log(`user ${req.params.id} updated`)
                });
            });            
        }
    });
});



routes.route("/api/user/:id").delete(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect.collection("users").deleteOne
        (myquery, function (err, result) {
            if (err) throw err;
            res.json(result);
            console.log(`user ${req.params.username} deleted`)
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
        console.log(`search for ${req.params.username}`)
    }
    );
});



routes.route("/api/user/:id/addgame").put(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
        $inc: {
            games_played: 1,
        }
    };
    db_connect.collection("users").updateOne(myquery, newvalues, function (err, result) {
            if (err) throw err;
            res.json(result);
            console.log(`user ${req.params.id} added  1 game`)
        }
    );
});



routes.route("/api/user/:id/addwin").put(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
        $inc: {
            wins: 1,
        }
    };
    db_connect.collection('users').updateOne(myquery, newvalues, function (err, result) {
            if (err) throw err;
            res.json(result);
            console.log(`user ${req.params.id} added  1 win`)
        }
    );
});



routes.route("/api/user/:id/addloss").put(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
        $inc: {
            losses: 1,
        }
    };
    db_connect.collection('users').updateOne(myquery, newvalues, function (err, result) {
            if (err) throw err;
            res.json(result);
            console.log(`user ${req.params.id} added  1 loss`)
        }
    );
});

routes.route("/api/user/:id/giveUp").put(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
        $inc: {
            losses: 1,
        }
    };
    db_connect.collection('users').updateOne(myquery, newvalues, function (err, result) {
            if (err) throw err;
            res.json(result);
            console.log(`user ${req.params.id} gave up`)
        }
    );
});


routes.route("/api/review").post(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myobj = {
        user: req.body.user,
        contents: req.body.contents,
    };
    db_connect.collection("reviews").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("1 review added")
    }
    );
    res.json({ message: "Review added successfully" });
});


routes.route("/api/review").get(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    db_connect.collection("reviews").find({}).toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
        console.log("reviews displayed")
    }
    );
});


routes.route("/api/review").delete(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    db_connect.collection("reviews").deleteMany({}, function (err, result) {
        if (err) throw err;
        res.json(result);
        console.log("reviews deleted")
    }
    );
});


routes.route("/api/review/:id").delete(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect.collection("reviews").deleteOne(myquery, function (err, result) {
        if (err) throw err;
        res.json(result);
        console.log(`review ${req.params.id} deleted`)
    }
    );
});


routes.route("/api/review/:id").put(function (req, res) {
    let db_connect = dbo.getDb("myDatabase");
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
        $set: {
            contents: req.body.contents,
        }
    };
    db_connect.collection("reviews").updateOne(myquery, newvalues, function (err, result) {
        if (err) throw err;
        res.json(result);
        console.log(`review ${req.params.id} updated`)
    }
    );
});







module.exports = routes;



