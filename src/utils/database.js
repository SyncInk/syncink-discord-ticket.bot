const mongoose = require('mongoose');
const config = require('../../config');
require('dotenv').config();

async function initDatabase() {
    if (!process.env.MONGO_URI) {
        console.error('[DB] MONGO_URI is missing in .env file!');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[DB] Connected to MongoDB');
}

// ========================
// TICKET FUNCTIONS
// ========================
async function createTicket(data) {
    const Ticket = getMongoModel();
    await new Ticket(data).save();
}

async function getTicket(channelId) {
    const Ticket = getMongoModel();
    return await Ticket.findOne({ channelId });
}

async function updateTicket(channelId, updateData) {
    const Ticket = getMongoModel();
    await Ticket.updateOne({ channelId }, updateData);
}

// ========================
// GUILD SETTINGS FUNCTIONS
// ========================
async function getGuildConfig(guildId) {
    const Settings = getGuildSettingsModel();
    let settings = await Settings.findOne({ guildId });
    if (!settings) {
        settings = await new Settings({ guildId }).save();
    }
    return settings;
}

async function updateGuildConfig(guildId, updateData) {
    const Settings = getGuildSettingsModel();
    await Settings.updateOne({ guildId }, updateData, { upsert: true });
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
