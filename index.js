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

// ✅ OpenAI endpoint
app.get("/", async (req, res) => {
    const prompt = req.query.prompt;
    console.log("Prompt received:", prompt);

    if (!prompt) return res.send("Hello World!");

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant that creates music soundtracks." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 300,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(response.data);
    } catch (err) {
        console.error("OpenAI error:", err.response?.data || err.message);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: err.message, details: err.response?.data || err });
    }
});

// ✅ Spotify recommendations endpoint (fixed)
app.post('/recommendations', async (req, res) => {
    const { trackIds } = req.body;
    console.log('trackIds received:', trackIds);

    if (!Array.isArray(trackIds) || trackIds.length === 0) {
        return res.status(400).json({ message: 'No track IDs provided' });
    }

    try {
        const tokenResponse = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(tokenResponse.body['access_token']);

        const validSeedTracks = trackIds.slice(0, 5); // max 5 allowed
        console.log("Requesting recommendations with seed tracks:", validSeedTracks);

        const recommendationsResponse = await spotifyApi.getRecommendations({
            seed_tracks: validSeedTracks,
            limit: 20,
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(recommendationsResponse.body.tracks);
    } catch (error) {
        console.error('Spotify recommendation error:', error.body || error);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            message: 'Failed to fetch recommendations',
            details: error.body || error.message
        });
    }
});

// ✅ Token endpoint (optional client use)
app.get("/spotify-token", async (req, res) => {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        const token = data.body.access_token;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json({ token });
    } catch (error) {
        console.error("Spotify token error:", error.body || error);
        res.status(500).json({ error: "Failed to get token", details: error.body || error });
    }
});

// ✅ Check OpenAI key
app.get("/check-key", async (req, res) => {
    try {
        const response = await axios.get("https://api.openai.com/v1/models", {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send("✅ API key is valid and working!");
    } catch (error) {
        console.error("API key check error:", error.response?.data || error.message);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).send("❌ " + (error.response?.data?.error?.message || "Unknown error"));
    }
});

// Catch-all
app.all('*', (req, res) => {
    console.log(`Unhandled request: ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
});
