const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3005;
const JWT_SECRET = "sreejalovesyash";

let users=[];

app.use(express.json());  //middleware which is needed whenever we use req.body

app.get("/", function(req,res){  //if we write "http://localhost:3005" in browser, it will show the website frontend in the browser
    res.sendFile(__dirname + "/public/index.html");
})

app.post("/signup", function(req,res){  //to create a username and password and signup
    const username = req.body.username;
    const password = req.body.password;

    users.push ({ 
        username: username,
        password: password
    })

    res.json({
        message: "You have successfully signed up"
    })

    console.log(users);
})

app.post("/signin", function(req,res){  //to check if usename and password is correct, if yes then sign in and give a token to the user
    const username = req.body.username;
    const password = req.body.password;
    
    let foundUser = null;
    for(let i=0; i<users.length; i++){
        if(users[i].username === username && users[i].password === password){
            foundUser= users[i];
        }
    }

    if(!foundUser){
        res.status(404).json({
            message: "Invalid username or password"
        })
    }
    else{
        const token = jwt.sign({ username : foundUser.username }, JWT_SECRET);
        res.json({
            token: token,
            message: "login successful"
        })
        res.header("jwt", token);
    }
})

function auth (req,res,next){
    const token = req.headers.token;
    console.log("received token:", token);
    const decodedInfo = jwt.verify(token, JWT_SECRET); //gives you the decoded data
    const decodedUsername = decodedInfo.username; //gives you the username from the decoded data

    if(decodedUsername){ //checks if the username is present in the decoded data
        req.username = decodedUsername; //this is used to pass the decoded username to the next endpoint (data is passed in req)
        return next();
    }
    
    if(!decodedUsername){
        return res.status(404).json({
            message: "You are not logged in" ///if there is no usernsame, that means your jwt is wrong and you didnt log in
        });
    }
}

/*app.get("/me", auth, function(req,res){  //to give the token and it will show the username and password
    console.log("received me req");
    let foundusers = null;
    for(let i=0; i<users.length; i++){
        if(users[i].username === req.username){ //"req.username" has the decoded username passed by the middleware auth
            foundusers = users[i];
        }
    }
    res.json({
        username : foundusers.username,
        password : foundusers.password
    })
})*/

app.listen(3005);
