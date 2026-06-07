const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const mongoose = require('mongoose');
const config = require('../../config');
require('dotenv').config();

let sqliteDb;

async function initDatabase() {
    if (config.database.useMongo) {
        if (!process.env.MONGO_URI) {
            console.error('[DB] MONGO_URI is missing in .env file!');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('[DB] Connected to MongoDB');
    } else {
        sqliteDb = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS tickets (
                channelId TEXT PRIMARY KEY,
                ticketId TEXT,
                creatorId TEXT,
                type TEXT,
                claimerId TEXT,
                status TEXT,
                createdAt INTEGER,
                closedAt INTEGER
            );
            CREATE TABLE IF NOT EXISTS guild_settings (
                guildId TEXT PRIMARY KEY,
                ticketCategoryId TEXT,
                logChannelId TEXT,
                messageLogChannelId TEXT,
                voiceLogChannelId TEXT,
                staffRoleIds TEXT,
                adminRoleIds TEXT,
                ownerRoleIds TEXT,
                developerRoleIds TEXT
            );
        `);
        
        // Migrate existing table to include new columns if they are missing
        try { await sqliteDb.exec('ALTER TABLE guild_settings ADD COLUMN messageLogChannelId TEXT;'); } catch (e) {}
        try { await sqliteDb.exec('ALTER TABLE guild_settings ADD COLUMN voiceLogChannelId TEXT;'); } catch (e) {}
        
        console.log('[DB] Connected to SQLite');
    }
}

// ========================
// TICKET FUNCTIONS
// ========================
async function createTicket(data) {
    if (config.database.useMongo) {
        const Ticket = getMongoModel();
        await new Ticket(data).save();
    } else {
        await sqliteDb.run(
            'INSERT INTO tickets (channelId, ticketId, creatorId, type, claimerId, status, createdAt, closedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [data.channelId, data.ticketId, data.creatorId, data.type, data.claimerId, data.status, data.createdAt, data.closedAt]
        );
    }
}

async function getTicket(channelId) {
    if (config.database.useMongo) {
        const Ticket = getMongoModel();
        return await Ticket.findOne({ channelId });
    } else {
        return await sqliteDb.get('SELECT * FROM tickets WHERE channelId = ?', [channelId]);
    }
}

async function updateTicket(channelId, updateData) {
    if (config.database.useMongo) {
        const Ticket = getMongoModel();
        await Ticket.updateOne({ channelId }, updateData);
    } else {
        const sets = [];
        const values = [];
        for (const [key, value] of Object.entries(updateData)) {
            sets.push(`${key} = ?`);
            values.push(value);
        }
        values.push(channelId);
        if (sets.length > 0) {
            await sqliteDb.run(`UPDATE tickets SET ${sets.join(', ')} WHERE channelId = ?`, values);
        }
    }
}

// ========================
// GUILD SETTINGS FUNCTIONS
// ========================
async function getGuildConfig(guildId) {
    if (config.database.useMongo) {
        const Settings = getGuildSettingsModel();
        let settings = await Settings.findOne({ guildId });
        if (!settings) {
            settings = await new Settings({ guildId }).save();
        }
        return settings;
    } else {
        let row = await sqliteDb.get('SELECT * FROM guild_settings WHERE guildId = ?', [guildId]);
        if (!row) {
            await sqliteDb.run('INSERT INTO guild_settings (guildId) VALUES (?)', [guildId]);
            row = { guildId, ticketCategoryId: null, logChannelId: null, messageLogChannelId: null, voiceLogChannelId: null, staffRoleIds: null, adminRoleIds: null, ownerRoleIds: null, developerRoleIds: null };
        }
        return {
            guildId: row.guildId,
            ticketCategoryId: row.ticketCategoryId,
            logChannelId: row.logChannelId,
            messageLogChannelId: row.messageLogChannelId,
            voiceLogChannelId: row.voiceLogChannelId,
            staffRoleIds: row.staffRoleIds ? JSON.parse(row.staffRoleIds) : [],
            adminRoleIds: row.adminRoleIds ? JSON.parse(row.adminRoleIds) : [],
            ownerRoleIds: row.ownerRoleIds ? JSON.parse(row.ownerRoleIds) : [],
            developerRoleIds: row.developerRoleIds ? JSON.parse(row.developerRoleIds) : []
        };
    }
}

async function updateGuildConfig(guildId, updateData) {
    if (config.database.useMongo) {
        const Settings = getGuildSettingsModel();
        await Settings.updateOne({ guildId }, updateData, { upsert: true });
    } else {
        // Ensure row exists
        await getGuildConfig(guildId);
        
        const sets = [];
        const values = [];
        for (const [key, value] of Object.entries(updateData)) {
            sets.push(`${key} = ?`);
            // stringify arrays for sqlite
            values.push(Array.isArray(value) ? JSON.stringify(value) : value);
        }
        values.push(guildId);
        if (sets.length > 0) {
            await sqliteDb.run(`UPDATE guild_settings SET ${sets.join(', ')} WHERE guildId = ?`, values);
        }
    }
}

// ========================
// MONGOOSE MODELS
// ========================
let TicketModel;
function getMongoModel() {
    if (!TicketModel) {
        const schema = new mongoose.Schema({
            channelId: { type: String, required: true, unique: true },
            ticketId: { type: String, required: true },
            creatorId: { type: String, required: true },
            type: { type: String, required: true },
            claimerId: { type: String, default: null },
            status: { type: String, default: 'open' },
            createdAt: { type: Number, default: Date.now },
            closedAt: { type: Number, default: null }
        });
        TicketModel = mongoose.model('Ticket', schema);
    }
    return TicketModel;
}

let GuildSettingsModel;
function getGuildSettingsModel() {
    if (!GuildSettingsModel) {
        const schema = new mongoose.Schema({
            guildId: { type: String, required: true, unique: true },
            ticketCategoryId: { type: String, default: null },
            logChannelId: { type: String, default: null },
            messageLogChannelId: { type: String, default: null },
            voiceLogChannelId: { type: String, default: null },
            staffRoleIds: { type: [String], default: [] },
            adminRoleIds: { type: [String], default: [] },
            ownerRoleIds: { type: [String], default: [] },
            developerRoleIds: { type: [String], default: [] }
        });
        GuildSettingsModel = mongoose.model('GuildSettings', schema);
    }
    return GuildSettingsModel;
}

module.exports = {
    initDatabase,
    createTicket,
    getTicket,
    updateTicket,
    getGuildConfig,
    updateGuildConfig
};
