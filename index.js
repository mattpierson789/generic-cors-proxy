
const express = require("express");
const cors = require("cors");
const axios = require("axios");


if (process.env.NODE_ENV === "development") {
    console.log("In development mode");
    require("dotenv").config();

}

const app = express();

app.use(cors());

app.get("/", (req, res) => {
 
    if (req.query.url)  {

        axios.get(req.query.url)
        .then(data => res.send(data.data))

    }   else {

        res.send("Hello world")
    }
    
})

app.listen(5001, () => {
    console.log("lisening on port 5001");
    
})
