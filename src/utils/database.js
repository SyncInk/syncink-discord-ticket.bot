const mongoose = require('mongoose');
const config = require('../../config');
const { emitGuildEvent } = require('./realtime');
const {
    defaultRoleGroupForCategory,
    getDefaultOpeningMessage,
    getDefaultPanelConfig,
    normalizeTicketOptions
} = require('./panelBuilder');

require('dotenv').config();

async function initDatabase() {
    if (!process.env.MONGO_URI) {
        console.error('[DB] MONGO_URI is missing in .env file!');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('[DB] Connected to MongoDB');
}

function buildDefaultGuildSettings(guildId) {
    return {
        guildId,
        ticketCategoryId: config.ticketCategoryId || null,
        logChannelId: config.logChannelId || null,
        transcriptChannelId: null,
        panelChannelId: null,
        staffRoleIds: Array.isArray(config.staffRoleIds) ? [...config.staffRoleIds] : [],
        adminRoleIds: Array.isArray(config.adminRoleIds) ? [...config.adminRoleIds] : [],
        ownerRoleIds: Array.isArray(config.ownerRoleIds) ? [...config.ownerRoleIds] : [],
        developerRoleIds: Array.isArray(config.developerRoleIds) ? [...config.developerRoleIds] : [],
        inactivityReminderMinutes: 120,
        panelConfig: getDefaultPanelConfig(),
        defaultTicketMessages: {
            openingLine: getDefaultOpeningMessage(),
            inactivityReminderText: '<a:sync_alert:1513822294831534220> **Inactivity Reminder**'
        },
        dashboardPreferences: {
            accentColor: config.colors?.primary || '#9B59B6',
            density: 'comfortable',
            motion: 'full',
            glass: true
        },
        categoryOverrides: config.ticketOptions.map((option) => ({
            value: option.value,
            label: option.label,
            description: option.description,
            emoji: option.emoji,
            roleIds: [],
            roleGroup: defaultRoleGroupForCategory(option.value)
        }))
    };
}

function toPlainDocument(doc) {
    if (!doc) return null;
    return typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
}

function normalizeGuildConfig(doc) {
    const plain = toPlainDocument(doc) || {};
    const defaults = buildDefaultGuildSettings(plain.guildId);
    const ticketOptions = normalizeTicketOptions(plain);

    return {
        ...defaults,
        ...plain,
        staffRoleIds: Array.isArray(plain.staffRoleIds) ? plain.staffRoleIds : defaults.staffRoleIds,
        adminRoleIds: Array.isArray(plain.adminRoleIds) ? plain.adminRoleIds : defaults.adminRoleIds,
        ownerRoleIds: Array.isArray(plain.ownerRoleIds) ? plain.ownerRoleIds : defaults.ownerRoleIds,
        developerRoleIds: Array.isArray(plain.developerRoleIds) ? plain.developerRoleIds : defaults.developerRoleIds,
        panelConfig: {
            ...defaults.panelConfig,
            ...(plain.panelConfig || {})
        },
        defaultTicketMessages: {
            ...defaults.defaultTicketMessages,
            ...(plain.defaultTicketMessages || {})
        },
        dashboardPreferences: {
            ...defaults.dashboardPreferences,
            ...(plain.dashboardPreferences || {})
        },
        categoryOverrides: ticketOptions.map((option) => ({
            value: option.value,
            label: option.label,
            description: option.description,
            emoji: option.emoji,
            roleIds: Array.isArray(option.roleIds) ? option.roleIds : [],
            roleGroup: option.roleGroup || defaultRoleGroupForCategory(option.value)
        })),
        ticketOptions
    };
}

async function createTicket(data) {
    const Ticket = getMongoModel();
    const createdTicket = await new Ticket({
        activityCount: 0,
        claimerIds: [],
        lastActivityAt: Date.now(),
        transferHistory: [],
        ...data
    }).save();

    if (createdTicket.guildId) {
        emitGuildEvent(createdTicket.guildId, 'ticket.created', {
            ticketId: createdTicket.ticketId,
            channelId: createdTicket.channelId
        });
    }

    return createdTicket;
}

async function getTicket(channelId) {
    const Ticket = getMongoModel();
    return await Ticket.findOne({ channelId });
}

async function updateTicket(channelId, updateData) {
    const Ticket = getMongoModel();
    await Ticket.updateOne({ channelId }, updateData);

    const newChannelId = updateData.channelId || channelId;
    const updatedTicket = await Ticket.findOne({ channelId: newChannelId });

    if (updatedTicket?.guildId) {
        emitGuildEvent(updatedTicket.guildId, 'ticket.updated', {
            ticketId: updatedTicket.ticketId,
            channelId: updatedTicket.channelId,
            status: updatedTicket.status
        });
    }

    return updatedTicket;
}

async function getAllOpenTickets() {
    const Ticket = getMongoModel();
    return await Ticket.find({ status: 'open' });
}

async function listTicketsByGuild(guildId, limit = 250) {
    const Ticket = getMongoModel();
    return await Ticket.find({ guildId }).sort({ createdAt: -1 }).limit(limit);
}

async function getGuildConfig(guildId) {
    const Settings = getGuildSettingsModel();
    let settings = await Settings.findOne({ guildId });

    if (!settings) {
        settings = await new Settings(buildDefaultGuildSettings(guildId)).save();
    }

    return normalizeGuildConfig(settings);
}

async function updateGuildConfig(guildId, updateData) {
    const Settings = getGuildSettingsModel();
    await Settings.updateOne({ guildId }, updateData, { upsert: true });
    const settings = await Settings.findOne({ guildId });
    const normalized = normalizeGuildConfig(settings);

    emitGuildEvent(guildId, 'config.updated', {
        section: 'settings'
    });

    return normalized;
}

async function createActivityLog({
    guildId,
    type,
    title,
    description,
    actorId = null,
    actorTag = null,
    ticketChannelId = null,
    relatedTicketId = null,
    metadata = {}
}) {
    const ActivityLog = getActivityLogModel();
    const log = await new ActivityLog({
        guildId,
        type,
        title,
        description,
        actorId,
        actorTag,
        ticketChannelId,
        relatedTicketId,
        metadata,
        createdAt: Date.now()
    }).save();

    emitGuildEvent(guildId, 'activity.created', {
        activity: toPlainDocument(log)
    });

    return log;
}

async function listActivityLogs(guildId, limit = 100) {
    const ActivityLog = getActivityLogModel();
    return await ActivityLog.find({ guildId }).sort({ createdAt: -1 }).limit(limit);
}

async function createAuditLog({
    guildId,
    action,
    actorId = null,
    actorTag = null,
    source = 'dashboard',
    changes = []
}) {
    const AuditLog = getAuditLogModel();
    const entry = await new AuditLog({
        guildId,
        action,
        actorId,
        actorTag,
        source,
        changes,
        createdAt: Date.now()
    }).save();

    emitGuildEvent(guildId, 'audit.created', {
        audit: toPlainDocument(entry)
    });

    return entry;
}

async function listAuditLogs(guildId, limit = 100) {
    const AuditLog = getAuditLogModel();
    return await AuditLog.find({ guildId }).sort({ createdAt: -1 }).limit(limit);
}

async function findTicketsMissingGuildId() {
    const Ticket = getMongoModel();
    return await Ticket.find({ $or: [{ guildId: null }, { guildId: { $exists: false } }] }).limit(500);
}

async function backfillTicketGuildIds(client, guildId) {
    const Ticket = getMongoModel();
    const tickets = await findTicketsMissingGuildId();

    for (const ticket of tickets) {
        const channel = client.channels.cache.get(ticket.channelId);
        if (channel?.guild?.id === guildId) {
            await Ticket.updateOne({ _id: ticket._id }, { guildId });
        }
    }
}

function getMongoModel() {
    if (mongoose.models.Ticket) {
        return mongoose.models.Ticket;
    }

    const schema = new mongoose.Schema({
        channelId: { type: String, required: true, unique: true },
        ticketId: { type: String, required: true },
        guildId: { type: String, default: null, index: true },
        creatorId: { type: String, required: true },
        type: { type: String, required: true },
        claimerId: { type: String, default: null },
        claimerIds: { type: [String], default: [] },
        status: { type: String, default: 'open' },
        createdAt: { type: Number, default: Date.now },
        claimedAt: { type: Number, default: null },
        lastActivityAt: { type: Number, default: Date.now },
        closedAt: { type: Number, default: null },
        closedById: { type: String, default: null },
        panelChannelId: { type: String, default: null },
        transcriptChannelId: { type: String, default: null },
        transcriptMessageUrl: { type: String, default: null },
        activityCount: { type: Number, default: 0 },
        transferHistory: [{
            fromChannelId: String,
            toChannelId: String,
            performedById: String,
            targetGroup: String,
            targetRoleIds: [String],
            timestamp: Number
        }]
    });

    return mongoose.model('Ticket', schema);
}

function getGuildSettingsModel() {
    if (mongoose.models.GuildSettings) {
        return mongoose.models.GuildSettings;
    }

    const schema = new mongoose.Schema({
        guildId: { type: String, required: true, unique: true },
        ticketCategoryId: { type: String, default: null },
        logChannelId: { type: String, default: null },
        transcriptChannelId: { type: String, default: null },
        panelChannelId: { type: String, default: null },
        staffRoleIds: { type: [String], default: [] },
        adminRoleIds: { type: [String], default: [] },
        ownerRoleIds: { type: [String], default: [] },
        developerRoleIds: { type: [String], default: [] },
        moderatorRoleIds: { type: [String], default: [] },
        inactivityReminderMinutes: { type: Number, default: 120 },
        panelConfig: {
            title: { type: String, default: getDefaultPanelConfig().title },
            description: { type: [String], default: getDefaultPanelConfig().description },
            color: { type: String, default: getDefaultPanelConfig().color },
            thumbnailUrl: { type: String, default: getDefaultPanelConfig().thumbnailUrl },
            placeholder: { type: String, default: getDefaultPanelConfig().placeholder }
        },
        defaultTicketMessages: {
            openingLine: { type: String, default: getDefaultOpeningMessage() },
            inactivityReminderText: { type: String, default: '<a:sync_alert:1513822294831534220> **Inactivity Reminder**' }
        },
        dashboardPreferences: {
            accentColor: { type: String, default: config.colors?.primary || '#9B59B6' },
            density: { type: String, default: 'comfortable' },
            motion: { type: String, default: 'full' },
            glass: { type: Boolean, default: true }
        },
        categoryOverrides: [{
            value: String,
            label: String,
            description: String,
            emoji: String,
            roleIds: { type: [String], default: [] },
            roleGroup: String
        }]
    });

    return mongoose.model('GuildSettings', schema);
}

function getActivityLogModel() {
    if (mongoose.models.ActivityLog) {
        return mongoose.models.ActivityLog;
    }

    const schema = new mongoose.Schema({
        guildId: { type: String, required: true, index: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        actorId: { type: String, default: null },
        actorTag: { type: String, default: null },
        ticketChannelId: { type: String, default: null },
        relatedTicketId: { type: String, default: null },
        metadata: { type: Object, default: {} },
        createdAt: { type: Number, default: Date.now }
    });

    return mongoose.model('ActivityLog', schema);
}

function getAuditLogModel() {
    if (mongoose.models.AuditLog) {
        return mongoose.models.AuditLog;
    }

    const schema = new mongoose.Schema({
        guildId: { type: String, required: true, index: true },
        action: { type: String, required: true },
        actorId: { type: String, default: null },
        actorTag: { type: String, default: null },
        source: { type: String, default: 'dashboard' },
        changes: [{
            field: String,
            before: mongoose.Schema.Types.Mixed,
            after: mongoose.Schema.Types.Mixed
        }],
        createdAt: { type: Number, default: Date.now }
    });

    return mongoose.model('AuditLog', schema);
}

module.exports = {
    backfillTicketGuildIds,
    buildDefaultGuildSettings,
    createActivityLog,
    createAuditLog,
    createTicket,
    getAllOpenTickets,
    getAuditLogModel,
    getActivityLogModel,
    getGuildConfig,
    getGuildSettingsModel,
    getMongoModel,
    getTicket,
    initDatabase,
    listActivityLogs,
    listAuditLogs,
    listTicketsByGuild,
    normalizeGuildConfig,
    toPlainDocument,
    updateGuildConfig,
    updateTicket
};
