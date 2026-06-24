require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./utils/database');
const migrateLegacySqlite = require('./utils/migrateSqlite');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

// Load Handlers
const loadHandlers = () => {
    const handlersPath = path.join(__dirname, 'handlers');
    const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
    
    for (const file of handlerFiles) {
        require(`./handlers/${file}`)(client);
    }
};

const { initDashboard } = require('./dashboardServer');

async function start() {
    try {
        await initDatabase();
        await migrateLegacySqlite();
        loadHandlers();
        await initDashboard(client); // Start web server immediately for Railway health checks
        await client.login(process.env.DISCORD_TOKEN);
    } catch (err) {
        console.error('[CRITICAL] Error starting the ticket system:', err);
    }
}

start();
