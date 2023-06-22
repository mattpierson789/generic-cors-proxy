// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");

// if (process.env.NODE_ENV === "development") {
//     console.log('in development mode')
//     require("dotenv").config();
// }

// const app = express();

// app.use(cors());

// app.get("/", (req, res) => {
//     // api url format domain + path + ? + api_key=key + 
//     if (req.query.prompt) {
//         // let api_key = `?api_key=${process.env.API_KEY}`
//         // let api_path = req.query.api_path
//         // console.log(api_path)
//         let url = 'https://api.openai.com/v1/completions'
//         // let fetchUrl = `${url}${api_path}${api_key}`
//         // console.log(fetchUrl)
//         let prompt = req.query.prompt

        
//         axios.post(url, {

//             model: "text-davinci-002",
//             prompt: prompt,
//             temperature: .7,
//             max_tokens: 300,

//         }, {

//             headers: {
            
//             "Authorization": `Bearer ${process.env.API_KEY}`,
//             "Content-Type": "application/json"
                
//             }


//         })               
//             .then(resBody => res.send(resBody.data));
//     } else {
//         res.send("Hello World!");
//     }
// });

// app.listen(5001, () => {
//     console.log("Listening on PORT: 5001")
// })
