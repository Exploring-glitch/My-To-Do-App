const axios = require("axios");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "2604SrEeJaDeY"
const port = 3005;

const {UserModel , TodoModel} = require("./db"); //importing the UserModel and TodoModel from db.js

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin:mu9wbw2g8TBgJBVx@cluster0.tgsxo.mongodb.net/todo-app-database"); //connect to the given MongoDB cluster and the database (/todo-app-database)

app.use(express.json()); //middleware which is needed whenever we use req.body




app.get("/", function(req,res){  //if we write "http://localhost:3005" in browser, it will show the website frontend in the browser
    res.sendFile(__dirname + "/public/index.html");
})

app.post("/signup", async function(req,res){  
    const requiredBody = z.object({ //We make a schema and specify how the object will look like and add input validations to it
        email: z.string().email("Email must be in correct format").max(100).min(5, "Email must contain at least characters"),
        password: z.string().max(50).min(5, "Password must contain atleast 5 characters").regex(/[A-Z]/,"Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at east one lowercase letter").regex(/[\d]/, "Password must contain at least one digit").regex(/[@$!%?&]/, "Password must contain at least one special character"),
        name: z.string().max(50).min(3, "Name must contain at least 3 characters")
    })
    const paresedDataWithSuccess = requiredBody.safeParse(req.body); //here we connect the users entered data(req.body) with our schema(requiredBody) and safeParse it
    if(!paresedDataWithSuccess.success){ //if somethinf is wrong it will show error
        return res.status(400).json({
            errors: paresedDataWithSuccess.error.errors.map(err => err.message)
        });
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    let errorThrown = false;

    try{
        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({ //we need to await because this is an asynchronous function which returns a promise 
            email: email,
            password: hashedPassword,
            name: name
        })
    }catch{
        res.status(403).json({
            message : "User already exists"
        })
        errorThrown = true;
    }

    if(!errorThrown){
        res.json({
            message: "You have successfully signed up"
        }) 
    }
})


app.post("/signin", async function(req,res){  //to check if usename and password is correct, if yes then sign in and give a token to the user
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email
    })

    if(!user){
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if(passwordCompare){
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET); //create a token with encoded user id
        res.header("jwttoken", token);
        res.json({
            token: token //return the token
        })
        
    }
    else{
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
})

function auth(req,res,next){
    try{
        const token = req.headers.token; //get the token from headers

        if(!token){
            return res.json({
                message : "No token provided"
            })
        }
    
        const decodedData = jwt.verify(token, JWT_SECRET); //verify the token 
        const decodedUserId = decodedData.id; //store the user id from the decoded data

        if(decodedData){
            req.userId = decodedUserId; //pass the decoded user id to the next endpoint
            next();
        }
    }
    catch(e){
        return res.status(404).json({
            message: "Invalid token" 
        });
    }
}

app.post("/addtodo", auth, async function(req,res){
    const userId = req.userId;
    const title = req.body.title;

    try{
        await TodoModel.create({
            userId: userId,
            title: title,
        })
    
        res.json({
            message : "Todo created successfully"
        })
    }
    catch (e) {
        return res.status(500).json({ message: "Error creating todo" });
    }

})

app.get("/gettodo", auth, async function(req,res){
    try{
        const userId = req.userId;
        const todos = await TodoModel.find({
            userId : userId
        })
        res.json({
            todos : todos
        })
    }
    catch(e){
        res.json({
            message: "Cannot fetch todos"
        })
    }

})

app.listen(3005);
