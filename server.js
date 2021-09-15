const express = require('express');
const cors = require('cors');
const { celebrate, Joi, errors, Segments } = require('celebrate');

const RestaurantDB = require("./modules/restaurantDB");
const db = new RestaurantDB();

const app = express();

app.use(express.json());
app.use(cors());

const HTTP_PORT = process.env.PORT || 8080;

app.get("/", function(req, res){
    res.json({message: "API Listening"});
});

//TODO: not working exactly
app.post("/api/restaraunts", function(req, res){
    const store = db.addNewRestaurant(req.body);
    // console.log(store);

    if(store){
        res.status(201).json({message: "name added"});
    }else{
        res.status(500).json({message: "no name was added"});
    }
    
});


//READ (ALL based on arguments provided)
///allows for url to be api/restaurants?page=1&perPage=5&borough=Bronx
app.get("/api/restaraunts", celebrate({
    [Segments.QUERY]: {
        page: Joi.number().integer(),
        perPage: Joi.number().integer(),
        borough: Joi.string().default('')
      }
}), async function(req, res){
    const storedPage = req.query.page;
    const storedperPage = req.query.perPage
    const storedBorough = req.query.borough;
    // console.log(storedPage);
    // console.log(storedperPage);
    // console.log(storedBorough);


    // console.log(await db.getAllRestaurants(parseInt(storedPage), parseInt(storedperPage), storedBorough));
    if(storedPage != undefined || storedperPage != undefined){
        res.json(await db.getAllRestaurants(parseInt(storedPage), parseInt(storedperPage), storedBorough));
    }else{
        res.status(400).json({message: "Please provide parames"});
    }
});
app.use(errors()); //middleware for errors 


//READ (ONE)
app.get("/api/restaraunts/:id", async function(req, res){
    const storedId = await db.getRestaurantById(req.params.id);
    

    // console.log(storedId);
    res.json(storedId);
});


app.put("/api/restaraunts/:id", async function(req, res){
    // console.log(req.params.id);
    if(await db.updateRestaurantById(req.body, req.params.id)){
        res.json({message: "name updated successfully"});
    }else{
        res.status(404).json({message: "ID was not found"});
    }
});


app.delete("/api/restaraunts/:id", async function(req, res){
    await db.deleteRestaurantById(req.params.id);
    res.json({message: "name deleted successfully"});
});


db.initialize("mongodb+srv://Stephen:dbpw4mongo@cluster0.truw5.mongodb.net/sample_restaurants?retryWrites=true&w=majority").then(()=>{
    app.listen(HTTP_PORT, ()=>{
    console.log(`server listening on: ${HTTP_PORT}`);
    });
   }).catch((err)=>{
    console.log(err);
   });
   