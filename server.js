const express = require("express");
const cors = require("cors");
const axios = require("axios");
const SpotifyWebApi = require('spotify-web-api-node');
const dotenv = require('dotenv');
dotenv.config();

if (process.env.NODE_ENV === "development") {
    console.log('in development mode')
    require("dotenv").config();
}

const app = express();

app.use(cors());

app.use(express.json()); // Add this line to support JSON-encoded bodies

// Initialize the Spotify API wrapper
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});  // close of spotifyApi initialization


    // Open AI Get Request Handler 

    app.get("/", (req, res) => {
        // api url format domain + path + ? + api_key=key + 
        if (req.query.prompt) {
            // let api_key = `?api_key=${process.env.API_KEY}`
            // let api_path = req.query.api_path
            // console.log(api_path)
            let url = 'https://api.openai.com/v1/completions'
            // let fetchUrl = `${url}${api_path}${api_key}`
            // console.log(fetchUrl)
            let prompt = req.query.prompt
            
            axios.post(url, {

                model: "text-davinci-002",
                prompt: prompt,
                temperature: .7,
                max_tokens: 300,

            }, {

                headers: {
                
                "Authorization": `Bearer ${process.env.API_KEY}`,
                "Content-Type": "application/json"
                    
                }


            })               
                .then(resBody => res.send(resBody.data));
        } else {
            res.send("Hello World!");
        }
    });
  

    // Spotify Reccoemndations Post Request     

    app.post('/recommendations', async (req, res) => {
        debugger
        const { trackIds } = req.body;
      
        try {
          // Retrieve an access token
          const data = await spotifyApi.clientCredentialsGrant();
          const accessToken = data.body['access_token'];
          spotifyApi.setAccessToken(accessToken);
      
          // Get recommendations from Spotify API
          const recommendations = await spotifyApi.getRecommendations({
            seed_tracks: trackIds,
            limit: 20,
          });
      
          // Send recommendations back to the client
          res.json(recommendations.body.tracks);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          res.status(500).json({ message: 'Error fetching recommendations' });
        }
      });


      // Catch all test route 

      app.all('*', (req, res) => {
        console.log(`Unhandled request: ${req.method} ${req.url}`);
        res.status(404).send('Not Found');
      });
      

// Generic Server Code choosing the port 

app.listen(5001, () => {
    console.log("Listening on PORT: 5001")
})