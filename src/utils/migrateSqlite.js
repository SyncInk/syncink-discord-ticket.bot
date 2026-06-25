const fs = require('fs');
const path = require('path');
const { getMongoModel, getGuildSettingsModel } = require('./database');

async function migrateLegacySqlite() {
    const dataPath = path.join(process.cwd(), 'legacy_data.json');
    const migratedPath = path.join(process.cwd(), 'legacy_data.json.migrated');

    // Only run if the json data file exists and hasn't been migrated
    if (!fs.existsSync(dataPath) || fs.existsSync(migratedPath)) {
        return;
    }

    console.log('[MIGRATION] Found legacy JSON data. Starting migration to MongoDB...');

    try {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        // 1. Migrate Tickets
        if (data.tickets && data.tickets.length > 0) {
            const Ticket = getMongoModel();
            let count = 0;

            for (const row of data.tickets) {
                // Check if ticket already exists in Mongo
                const existing = await Ticket.findOne({ channelId: row.channelId });
                if (!existing) {
                    await Ticket.create({
                        channelId: row.channelId,
                        ticketId: row.ticketId || `ticket-${row.channelId}`,
                        guildId: null, // Will be backfilled later
                        creatorId: row.creatorId || 'unknown',
                        type: row.type || 'general',
                        claimerId: row.claimerId || null,
                        status: row.status || 'open',
                        createdAt: row.createdAt || Date.now(),
                        closedAt: row.closedAt || null
                    });
                    count++;
                }
            }
            console.log(`[MIGRATION] Successfully migrated ${count} tickets to MongoDB.`);
        }

        // 2. Migrate Guild Settings
        if (data.settings && data.settings.length > 0) {
            const Settings = getGuildSettingsModel();
            let count = 0;

            for (const row of data.settings) {
                const existing = await Settings.findOne({ guildId: row.guildId });
                if (!existing) {
                    await Settings.create({
                        guildId: row.guildId,
                        ticketCategoryId: row.ticketCategoryId || null,
                        logChannelId: row.logChannelId || null,
                        transcriptChannelId: row.transcriptChannelId || null,
                        staffRoleIds: row.staffRoleId ? [row.staffRoleId] : [],
                        panelChannelId: row.panelChannelId || null
                    });
                    count++;
                }
            }
            console.log(`[MIGRATION] Successfully migrated ${count} guild settings to MongoDB.`);
        }

        // 3. Mark as migrated
        try {
            fs.renameSync(dataPath, migratedPath);
            console.log('[MIGRATION] Migration complete. legacy_data.json has been renamed.');
        } catch (fsErr) {
            console.error('[MIGRATION] Could not rename file. Please delete legacy_data.json manually.', fsErr);
        }

    } catch (error) {
        console.error('[MIGRATION] Error during migration process:', error);
    }
}

module.exports = migrateLegacySqlite;
