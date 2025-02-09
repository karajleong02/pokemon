const express = require("express");
const res = require("express/lib/response");
const { json, redirect } = require("express/lib/response");
const bcrypt = require("bcryptjs")// for hashing passwords
const costFactor = 10; // used for the alt
let authenticated = false; // used to see if user is logged in
let username = "";

// let's make a connection to our mysql server
const mysql = require("mysql2")

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Linhj420",
    database: "CS2803"
})

conn.connect(function(err){
    if(err){
        console.log("Error:", err);
    }else{
        console.log("Connection established.")
    }
})

// app will be our express instance
const app = express();
username="ronnie"
password="12345"

// Serve static files from the public dir
// if you do not include this, then navigation to the localhost will not show anything
app.use(express.static("public")); // will use the index.html file

// the following is a route
// serve home page
// note that our callback function is anonymous here
app.get("/signup", function(req, res){
    res.sendFile(__dirname + "/public/" + "signup.html");
})




// recall that the login information was passed as a parameter in xhr.send() as a POST request
// the middleware function express.urlencoded must be used for POST requests
// the data will be in the req.body object
app.use(express.urlencoded({extended:false}));
app.post("/sendWin", function(req, res) {
    console.log("got here");
    conn.query("update registeredUsers set bjwin = bjwin + 1, bjtotals = bjtotals + 1 where username = ?", [username],  function(err, rows){
        if(err) {
            res.json({success: false, message: "server doesn't work"});
        } else {
            res.json({succes: true, message: "server does work"});
        }
    })
})

app.post("/sendLose", function(req, res) {
    console.log("got here");
    conn.query("update registeredUsers set bjlose = bjlose + 1, bjtotals = bjtotals + 1 where username = ?", [username],  function(err, rows){
        if(err) {
            res.json({success: false, message: "server doesn't work"});
        } else {
            res.json({succes: true, message: "server does work"});
        }
    })
})

app.post("/sendTie", function(req, res) {
    console.log("got here");
    conn.query("update registeredUsers set bjtotals = bjtotals + 1 where username = ?", [username],  function(err, rows){
        if(err) {
            res.json({success: false, message: "server doesn't work"});
        } else {
            res.json({succes: true, message: "server does work"});
        }
    })
})
app.post("/sendWinStreak", function(req, res){
    console.log("got here sendwinstreak");
    console.log(req.body.warstreak);
    var winstreak = JSON.stringify(req.body.warstreak);
    console.log(winstreak);
    
    queryString = "update registeredUsers set warstreak = " + winstreak + " where warstreak < " + winstreak + " and username = ?";
        conn.query(queryString, [username], function(err, rows){
            if(err){
                res.json({success: false, message: "server error"});
            } else {
                res.json({success: true, message: "server error"});
            }
    })
})

app.post("/register", function(req, res){
        console.log("got here");
            // we check to see if username is available
            usernameQuery = "Select username from registeredUsers where username  = ?"
            conn.query(usernameQuery, [req.body.username], function(err, rows){ 
                if(err){
                    res.json({success: false, message: "server error"})
                }
                // we check to see if the username is already taken
                if (rows.length >0){
                    res.json({success: false, message: "username taken"})
                }
                // if it isn't, we insert the user into database
                else{
                    // we create a password hash before storing the password
                    passwordHash = bcrypt.hashSync(req.body.password, costFactor);
                    insertUser = "insert into registeredUsers values(?, ?, 0, 0, 0, 0)"
                    conn.query(insertUser, [req.body.username, passwordHash], function(err, rows){
                        if (err){
                            res.json({success: false, message: "server error"})                           
                        }
                        else{
                            res.json({success: true, message: "user registered"})
                            console.log("got here 1å");
                        }
                    })
                }
            });
})

// post to route "attempt login"
app.post("/attempt_login", function(req, res){
    // we check for the username and password to match.
    conn.query("select password from registeredusers where username = ?", [req.body.username], function (err, rows){
        if(err){
            res.json({success: false, message: "user doesn't exists"});
        }else{
            storedPassword = rows[0].password // rows is an array of objects e.g.: [ { password: '12345' } ]
            // bcrypt.compareSync let's us compare the plaintext password to the hashed password we stored in our database
            if (bcrypt.compareSync(req.body.password, storedPassword)){
                username = req.body.username;
                authenticated = true;
                console.log(username);
                res.json({success: true, message: "logged in"})
            }else{
                authenticated = false;
                res.json({success: false, message:"password is incorrect"})
            }
        }
    })  
})


app.get("/stats", function(req, res){
    console.log("got to get stats");
    console.log(authenticated);
    if(authenticated){
        console.log("authenticated stats");
        // res.sendFile(__dirname + "/public/" + "stats.html");
        conn.query("select username, bjwin, bjlose, bjtotals, warstreak from registeredUsers where username = ?", [username], function (err, rows) {
            if (err) {
                res.json({sucess: false});
            } else {

                console.log(rows[0]);
                console.log(rows[0].bjwin);   
                res.send(rows[0]);
            }
        })
    }else{
        console.log("not workign");
        res.json({sucess: false});
        // res.sendFile(__dirname + "/public/" + "main.html");
    }
})


// if the user navigates to localhost:3000/main, then the main page will be loaded.
app.get("/main", function(req, res){
    if(authenticated){
        res.sendFile(__dirname + "/public/" + "main.html");
    }else{
        res.send("<p>not logged in <p><a href='/'>login page</a>")
    }
    
})

// Start the web server
// 3000 is the port #
// followed by a callback function
app.listen(3000, function() {
   console.log("Listening on port 3000...");
});