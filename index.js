const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'Iamthephenomenal#123'
});

//Fake data
let randomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
}

//Home route...
app.get("/", (req,res) => {
  let query = `SELECT count(*) FROM user`;

  try{
      connection.query(query, (err, result) => {
          if(err) throw err;
          let count = result[0]["count(*)"];
          res.render("home.ejs", {count});
        });
    }
    catch(err){
      console.log(err);
      res.send("Some error in DB");
    }
})

//View route...
app.get("/user", (req,res) => {
  let query = `SELECT * FROM user`;

  try{
    connection.query(query, (err, users) => {
        if(err) throw err;
        res.render("viewuser.ejs", {users});
      });
  }
  catch(err){
    console.log(err);
    res.send("Some error in DB");
  }
})

app.get("/user/:id/edit", (req, res) => {
  let {id} = req.params;
  let query = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(query, (err, result) => {
        if(err) throw err;
        let data = result[0];
        res.render("edit.ejs", {data});
      });
  }
  catch(err){
    console.log(err);
    res.send("Some error in DB");
  }
})

//Update route...
app.patch("/user/:id", (req,res) => {
  // res.send("patch request sent");
  let {id} = req.params;
  let {password : formPassword, username : newUsername} = req.body;
  let query1 = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(query1, (err, result) => {
        if(err) throw err;
        let data = result[0];
        if(data.password != formPassword){
          res.send("WRONG PASSWORD ATTEMPTED");
        }
        else{
          let query2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`
          connection.query(query2, (err, result) => {
            if(err) throw err;
            console.log(result);
            res.redirect("/user");
          })
        }

      });
  }
  catch(err){
    console.log(err);
    res.send("Some error in DB");
  }
})

app.get("/user/new", (req,res) => {
    res.render("new.ejs");
})

//Create route...
app.post("/user", (req,res) => {
  let {id : formId, username : formUsername, email : formEmail, password : formPassword} = req.body;
  let query = `INSERT INTO user (id, username, email, password) VALUES ('${formId}', '${formUsername}', '${formEmail}', '${formPassword}')`;
  try{
  connection.query(query, (err,result) => {
    if(err) throw err;
    console.log(result);
    res.redirect("/user");
  })
}
catch(err){
  console.log("ERROR IN DATABASE DETECTED");
}
})

app.get("/user/:id/delete", (req,res) => {
  let {id} = req.params;
  res.render("delete.ejs", {id});
})

//Delete route...
app.delete("/user/:id", (req,res) => {
  let {id} = req.params;
  let {email : formEmail, password : formPassword} = req.body;
  let query1 = `SELECT * FROM user WHERE id = '${id}'`;
  connection.query(query1, (err,result) => {
    let data = result[0];
    if(formEmail === data.email && formPassword === data.password){
      let query2 = `DELETE FROM user WHERE email = '${formEmail}' AND password = '${formPassword}'`;
      connection.query(query2, (err,result) => {
          res.redirect("/user");
      })
    }
    else{
      res.send("ERROR OCCURED IN DATABASE");
    }
  })
})

app.listen("8080", () => {
  console.log("Listening at port 8080");
})