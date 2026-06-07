require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./utils/database');

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

async function start() {
    try {
        await initDatabase();
        loadHandlers();
        await client.login(process.env.DISCORD_TOKEN);
    } catch (err) {
        console.error('[CRITICAL] Error starting the ticket system:', err);
    }
}

start();
