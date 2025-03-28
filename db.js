const mongoose = require("mongoose"); 
const Schema = mongoose.Schema; 
const ObjectId = mongoose.ObjectId;

const User = new Schema({ //create a basic schema(structure) of how your database will look like
    email: { type: String, unique: true }, //the email must be unique i.e, two users cannot login with same email
    password: String,
    name: String
})
const Todo = new Schema({
    userId: ObjectId,
    title: String,
})

UserModel = mongoose.model('users', User); //create a model where the schema for the users database is User so it stores the data in the users
TodoModel = mongoose.model('todos', Todo);

module.exports = { //this is used to export in js, so that we can import and use the Usermodel and Todomodel in other files (index.js).
    UserModel: UserModel,
    TodoModel: TodoModel
}
    