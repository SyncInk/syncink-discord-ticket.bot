const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');
const { getMongoModel, getGuildSettingsModel } = require('./database');

async function migrateLegacySqlite() {
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    const migratedPath = path.join(process.cwd(), 'database.sqlite.migrated');

    // Only run if the database exists and hasn't been migrated
    if (!fs.existsSync(dbPath) || fs.existsSync(migratedPath)) {
        return;
    }

    console.log('[MIGRATION] Found legacy SQLite database. Starting migration to MongoDB...');

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, async (err) => {
            if (err) {
                console.error('[MIGRATION] Failed to connect to SQLite:', err);
                return reject(err);
            }

            try {
                // 1. Migrate Tickets
                await new Promise((res, rej) => {
                    db.all('SELECT * FROM tickets', [], async (err, rows) => {
                        if (err) {
                            if (err.message.includes('no such table')) return res(); // No tickets table
                            return rej(err);
                        }

                        const Ticket = getMongoModel();
                        let count = 0;

                        for (const row of rows) {
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
                        res();
                    });
                });

                // 2. Migrate Guild Settings
                await new Promise((res, rej) => {
                    db.all('SELECT * FROM guild_settings', [], async (err, rows) => {
                        if (err) {
                            if (err.message.includes('no such table')) return res();
                            return rej(err);
                        }

                        const Settings = getGuildSettingsModel();
                        let count = 0;

                        for (const row of rows) {
                            const existing = await Settings.findOne({ guildId: row.guildId });
                            if (!existing) {
                                await Settings.create({
                                    guildId: row.guildId,
                                    ticketCategoryId: row.ticketCategoryId || null,
                                    logChannelId: row.logChannelId || null,
                                    transcriptChannelId: row.transcriptChannelId || null,
                                    staffRoleIds: row.staffRoleId ? [row.staffRoleId] : [], // Convert legacy single role to array
                                    panelChannelId: row.panelChannelId || null
                                });
                                count++;
                            }
                        }
                        console.log(`[MIGRATION] Successfully migrated ${count} guild settings to MongoDB.`);
                        res();
                    });
                });

                // 3. Mark as migrated
                db.close((err) => {
                    if (err) console.error('[MIGRATION] Error closing SQLite DB:', err);
                    
                    try {
                        fs.renameSync(dbPath, migratedPath);
                        console.log('[MIGRATION] Migration complete. database.sqlite has been renamed to database.sqlite.migrated.');
                        resolve();
                    } catch (fsErr) {
                        console.error('[MIGRATION] Could not rename file. Please delete database.sqlite manually.', fsErr);
                        resolve();
                    }
                });
            } catch (error) {
                console.error('[MIGRATION] Error during migration process:', error);
                reject(error);
            }
        });
    });
}

module.exports = migrateLegacySqlite;
