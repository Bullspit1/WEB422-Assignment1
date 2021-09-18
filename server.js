/*********************************************************************************
* WEB422 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
* 
* Name: Stephen Ditta Student ID: 033787144 Date: 09/16/2021
* Heroku Link: https://serene-dawn-47935.herokuapp.com/
*
********************************************************************************/

const express = require('express');
const cors = require('cors');
const {query, validationResult} = require('express-validator');

//Environment variable for connection string
// require('dotenv').config();
// const { MONGODB_CONN_STRING } = process.env;
    
const accessURI = process.env.MONGODB_CONN_URI;

const RestaurantDB = require("./modules/restaurantDB");
const db = new RestaurantDB();

const app = express();

app.use(express.json());
app.use(cors());

const HTTP_PORT = process.env.PORT || 8080;

app.get("/", function(req, res){
    res.json({message: "API Listening"});
});


app.post("/api/restaurants", function(req, res){

    //if no object is provided in the post request 
    if(req.body.constructor === Object && Object.keys(req.body).length === 0){
        res.status(400).json("Please provide an object");
    }else{
        db.addNewRestaurant(req.body).then((response) => {
            console.log(response);
            res.status(201).json({message: "Restaurant successfully added"});
        }).catch((err) => {
            res.status(500).json({message: "Restaurant could not be added"});
        });
    }

});


//READ (ALL based on arguments provided)
//allows for url to be api/restaurants?page=1&perPage=5&borough=Bronx
app.get("/api/restaurants",[
    query('page').isInt({min: 1}).withMessage('page param must be a whole number greater than 1'),
    query('perPage').isInt({min: 1}).withMessage('page param must be a whole number greater than 1'),
    query('borough').isInt().withMessage('Must be a string')
], async function(req,res) {
    const storedPage = req.query.page;
    const storedperPage = req.query.perPage
    const storedBorough = req.query.borough;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    if(storedPage != undefined || storedperPage != undefined){
        res.json(await db.getAllRestaurants(storedPage, storedperPage, storedBorough));
    }else{
        res.status(400).json({message: "Please provide parames"});
    }
});


//READ (ONE)
app.get("/api/restaurants/:id", async function(req, res){

    db.getRestaurantById(req.params.id).then((response) => {
        res.json(response);
    }).catch((err) => {
        res.status(400).json({message: "Can't find a restaurant with the id of " + req.params.id});
    });

});


//UPDATE
app.put("/api/restaurants/:id", function(req, res){

    db.updateRestaurantById(req.body, req.params.id).then((response) => {
        res.status(200).json({message: req.params.id + " was successfully updated"});
    }).catch((err) => {
        res.status(400).json({message: "Could not update " + req.params.id});
    });

});

//DELETE
app.delete("/api/restaurants/:id", function(req, res){
    db.deleteRestaurantById(req.params.id).then((response) => {
        res.status(200).json({message: "name deleted successfully"});
    }).catch((err) => {
        res.status(400).json({message: "Could not delete " + req.params.id});
    });
    
});


db.initialize(accessURI).then(()=>{
    app.listen(HTTP_PORT, ()=>{
    console.log(`server listening on: ${HTTP_PORT}`);
    });
   }).catch((err)=>{
    console.log(err);
   });
   