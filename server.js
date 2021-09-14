const express = require('express');
var cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const HTTP_PORT = process.env.PORT || 8080;

app.get("/", function(req, res){
    res.json({message: "API Listening"});
});


app.listen(HTTP_PORT, function(){
    console.log(`server is listening on: ${HTTP_PORT}`);
});