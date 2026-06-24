const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const axios = require('axios');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

async function initDashboard(client) {
    const app = express();
    const server = createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });

    app.use(cors());
    app.use(express.json());

    // Secure Session setup backed by MongoDB
    app.use(session({
        secret: process.env.SESSION_SECRET || 'syncink_super_secret_dash',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 week
    }));

    // Attach Socket.io to client so bot events can emit to dashboard
    client.io = io;

    io.on('connection', (socket) => {
        console.log('[DASHBOARD] Client connected to WebSocket');
    });

    // --- AUTHENTICATION ROUTES --- //
    app.get('/api/auth/login', (req, res) => {
        const clientId = process.env.DISCORD_CLIENT_ID || client.user.id;
        const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback');
        const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`;
        res.redirect(url);
    });

    app.get('/api/auth/callback', async (req, res) => {
        if (!req.query.code) return res.redirect('/login');
        try {
            const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID || client.user.id,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

            const userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
            });

            const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
            });

            // Filter for guilds where user is Owner or Administrator
            const adminGuilds = guildsResponse.data.filter(g => 
                g.owner || (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8)
            );

            req.session.user = userResponse.data;
            req.session.adminGuilds = adminGuilds;
            req.session.accessToken = tokenResponse.data.access_token;
            
            res.redirect('/');
        } catch (error) {
            console.error('[DASHBOARD AUTH ERROR]', error.response?.data || error.message);
            res.redirect('/login?error=auth_failed');
        }
    });

    app.get('/api/auth/me', (req, res) => {
        if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
        res.json({ user: req.session.user, guilds: req.session.adminGuilds });
    });

    app.get('/api/auth/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    });

    // --- API ROUTES --- //
    // Dashboard Stats API
    app.get('/api/stats', (req, res) => {
        if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
        // Example dynamic stats fetching logic here
        res.json({
            totalTickets: 142,
            openTickets: 12,
            avgResponse: '5m 12s',
            activeStaff: 8
        });
    });

    // --- SERVE FRONTEND --- //
    // If running in production on Railway, serve the built Vite app
    app.use(express.static(path.join(__dirname, '../dashboard/dist')));
    
    // Catch-all to serve React SPA for unknown routes
    app.use((req, res) => {
        try {
            res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'));
        } catch (err) {
            res.status(500).send('Dashboard is still building or failed to compile. Check Railway build logs.');
        }
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`[DASHBOARD] Web server & WebSockets running on port ${PORT}`);
    });
}

module.exports = { initDashboard };
