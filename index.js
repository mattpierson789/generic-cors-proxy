const express = require("express");
const cors = require("cors");
const axios = require("axios");
const SpotifyWebApi = require('spotify-web-api-node');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Spotify API setup
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// OpenAI endpoint
app.get("/", (req, res) => {
    const prompt = req.query.prompt;
    console.log("Prompt received:", prompt);

    if (!prompt) return res.send("Hello World!");

    axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant that creates music soundtracks." },
            { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
    }, {
        headers: {
            "Authorization": `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => res.send(response.data))
    .catch(err => {
        console.error("OpenAI error:", err.response?.data || err.message);
        res.status(500).json({ error: err.message, details: err.response?.data || err });
    });
});

// Spotify recommendations endpoint
app.post('/recommendations', async (req, res) => {
    const { trackIds } = req.body;

    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);

        const recommendations = await spotifyApi.getRecommendations({
            seed_tracks: trackIds,
            limit: 20,
        });

        res.json(recommendations.body.tracks);
    } catch (error) {
        console.error('Spotify error:', error);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
});

// Catch-all
app.all('*', (req, res) => {
    console.log(`Unhandled request: ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
});

app.get("/check-key", async (req, res) => {
    try {
        const response = await axios.get("https://api.openai.com/v1/models", {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        res.send("✅ API key is valid and working!");
    } catch (error) {
        console.error("API key check error:", error.response?.data || error.message);
        res.status(500).send("❌ " + (error.response?.data?.error?.message || "Unknown error"));
    }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
});
