// index.js
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Step 1: Redirect to Authorization URL
app.get('/auth', (req, res) => {
    const authUrl = `https://threads.net/oauth/authorize?client_id=${process.env.THREADS_APP_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&scope=threads_basic,threads_content_publish&response_type=code`;
    res.redirect(authUrl);
});

// Step 2: Handle Redirect and Exchange Code for Token
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No authorization code provided.');
    }

    try {
        const response = await axios.post('https://graph.threads.net/oauth/access_token', null, {
            params: {
                client_id: process.env.THREADS_APP_ID,
                client_secret: process.env.THREADS_APP_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: process.env.REDIRECT_URI,
                code,
            },
        });

        const { access_token, user_id } = response.data;

        // Handle successful authentication
        res.send(`Access Token: ${access_token}, User ID: ${user_id}`);
    } catch (error) {
        console.error('Error exchanging code for token:', error.response.data);
        res.status(500).send('Error exchanging code for token.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
