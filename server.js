const express = require('express');
const cors = require('cors');
const { celebrate, Joi, errors, Segments } = require('celebrate');
const {query, validationResult} = require('express-validator');

const RestaurantDB = require("./modules/restaurantDB");
const db = new RestaurantDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(errors()); //middleware for celebrate errors 

const HTTP_PORT = process.env.PORT || 8080;

app.get("/", function(req, res){
    res.json({message: "API Listening"});
});

//TODO: not working exactly
app.post("/api/restaurants", celebrate({
    [Segments.BODY]: Joi.object().keys({
            building: Joi.string().required(),
            coord: Joi.number().integer().required(),
            street: Joi.string().required(),
            zipcode: Joi.string().required()
        // borough: Joi.string().required(),
        // cuisine: Joi.string().required(),
        // grades: {
        //     date: Joi.date().required().required(),
        //     grade: Joi.string().required(),
        //     score: Joi.number().integer().required()
        // },
        // name: Joi.string().required(),
        // restaurant_id: Joi.string().required()
    })
  }), function(req, res){
    const store = db.addNewRestaurant(req.body);
    // console.log(store);

    // if(store){
    //     res.status(201).json({message: "Restaraunt added"});
    // }else{
    //     res.status(500).json({message: "no restaraunt was added"});
    // }

    //if no object is provided in the post request 
    // if(req.body.constructor === Object && Object.keys(req.body).length === 0){
    //     console.log('Object missing');
    // }else{

    // }
    
});


//READ (ALL based on arguments provided)
///allows for url to be api/restaurants?page=1&perPage=5&borough=Bronx
app.get("/api/restaurants", celebrate({
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

// app.get("/api/restaurants",[
//     query('page').isInt({min: 1}).withMessage('page param must be a wholoe number greater than 1')
//     // TODO: Add more validations for query parameters
// ], (req,res)=>{
//     const errors = validationResult(req);
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors: errors.array() })
//     }

//     // proceed with the rest of the function, ie: db.getAllRestaurants().then().catch();
// });



//READ (ONE)
app.get("/api/restaurants/:id", async function(req, res){
    const storedId = await db.getRestaurantById(req.params.id);
    

    // console.log(storedId);
    res.json(storedId);
});


app.put("/api/restaurants/:id", async function(req, res){
    // console.log(req.params.id);
    if(await db.updateRestaurantById(req.body, req.params.id)){
        res.json({message: "name updated successfully"});
    }else{
        res.status(404).json({message: "ID was not found"});
    }
});


app.delete("/api/restaurants/:id", async function(req, res){
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
   