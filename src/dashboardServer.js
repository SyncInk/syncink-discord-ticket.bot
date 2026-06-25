const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const axios = require('axios');
const path = require('path');
const { ChannelType } = require('discord.js');

const db = require('./utils/database');
const { setSocketServer } = require('./utils/realtime');
const { sendConfiguredTicketPanel } = require('./utils/ticketUtils');

function flattenConfigSection(sectionName, value) {
    if (Array.isArray(value)) {
        return [{ field: sectionName, value }];
    }

    if (!value || typeof value !== 'object') {
        return [{ field: sectionName, value }];
    }

    return Object.entries(value).map(([key, nestedValue]) => ({
        field: `${sectionName}.${key}`,
        value: nestedValue
    }));
}

function buildAuditChanges(previousConfig, nextConfig, updateData) {
    const changes = [];

    for (const [key] of Object.entries(updateData)) {
        const previousEntries = flattenConfigSection(key, previousConfig?.[key]);
        const nextEntries = flattenConfigSection(key, nextConfig?.[key]);
        const nextMap = new Map(nextEntries.map((entry) => [entry.field, entry.value]));

        for (const entry of previousEntries) {
            const nextValue = nextMap.get(entry.field);
            if (JSON.stringify(entry.value) !== JSON.stringify(nextValue)) {
                changes.push({
                    field: entry.field,
                    before: entry.value,
                    after: nextValue
                });
            }
            nextMap.delete(entry.field);
        }

        for (const [field, nextValue] of nextMap.entries()) {
            changes.push({
                field,
                before: undefined,
                after: nextValue
            });
        }
    }

    return changes;
}

function summarizeChannel(channel) {
    return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        parentId: channel.parentId || null
    };
}

function summarizeRole(role) {
    return {
        id: role.id,
        name: role.name,
        color: role.hexColor,
        isAdmin: role.permissions.has('Administrator'),
        position: role.position
    };
}

function summarizeUser(client, guild, userId) {
    if (!userId) {
        return null;
    }

    const member = guild.members.cache.get(userId);
    const user = member?.user || client.users.cache.get(userId);

    if (!user) {
        return {
            id: userId,
            displayName: `Unknown User (${userId})`,
            avatarUrl: null
        };
    }

    return {
        id: userId,
        displayName: member?.displayName || user.username,
        avatarUrl: user.displayAvatarURL({ size: 128 }),
        username: user.username
    };
}

function mapTicketRecord(ticket, client, guild, guildConfig) {
    const categoryConfig = guildConfig.ticketOptions.find((option) => option.value === ticket.type);

    return {
        id: ticket._id?.toString?.() || ticket.ticketId,
        ticketId: ticket.ticketId,
        channelId: ticket.channelId,
        channelName: guild.channels.cache.get(ticket.channelId)?.name || 'Archived ticket',
        creator: summarizeUser(client, guild, ticket.creatorId),
        claimer: summarizeUser(client, guild, ticket.claimerId),
        claimers: (ticket.claimerIds || []).map((userId) => summarizeUser(client, guild, userId)).filter(Boolean),
        status: ticket.status,
        type: ticket.type,
        category: categoryConfig ? {
            value: categoryConfig.value,
            label: categoryConfig.label,
            emoji: categoryConfig.emoji
        } : {
            value: ticket.type,
            label: ticket.type
        },
        createdAt: ticket.createdAt,
        claimedAt: ticket.claimedAt || null,
        closedAt: ticket.closedAt || null,
        lastActivityAt: ticket.lastActivityAt || ticket.createdAt,
        transcriptMessageUrl: ticket.transcriptMessageUrl || null,
        transcriptAvailable: Boolean(ticket.transcriptMessageUrl),
        transferHistory: Array.isArray(ticket.transferHistory) ? ticket.transferHistory : []
    };
}

function mapActivityRecord(activity, client, guild) {
    return {
        id: activity._id?.toString?.() || `${activity.type}-${activity.createdAt}`,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        createdAt: activity.createdAt,
        actor: summarizeUser(client, guild, activity.actorId),
        ticketChannelId: activity.ticketChannelId,
        relatedTicketId: activity.relatedTicketId,
        metadata: activity.metadata || {}
    };
}

function mapAuditRecord(audit, client, guild) {
    return {
        id: audit._id?.toString?.() || `${audit.action}-${audit.createdAt}`,
        action: audit.action,
        createdAt: audit.createdAt,
        source: audit.source,
        actor: summarizeUser(client, guild, audit.actorId),
        changes: Array.isArray(audit.changes) ? audit.changes : []
    };
}

function computeDailySeries(tickets, days = 7) {
    const now = new Date();
    const buckets = [];

    for (let index = days - 1; index >= 0; index -= 1) {
        const current = new Date(now);
        current.setDate(now.getDate() - index);
        const dateKey = current.toISOString().slice(0, 10);
        buckets.push({
            date: dateKey,
            count: 0
        });
    }

    const bucketMap = new Map(buckets.map((bucket) => [bucket.date, bucket]));

    for (const ticket of tickets) {
        const dateKey = new Date(ticket.createdAt).toISOString().slice(0, 10);
        const bucket = bucketMap.get(dateKey);
        if (bucket) {
            bucket.count += 1;
        }
    }

    return buckets;
}

function computeStats(tickets, activities) {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((ticket) => ticket.status === 'open').length;
    const closedTickets = tickets.filter((ticket) => ticket.status === 'closed').length;
    const transferredTickets = tickets.filter((ticket) => (ticket.transferHistory || []).length > 0).length;
    const claimedTickets = tickets.filter((ticket) => Boolean(ticket.claimerId)).length;

    const firstResponseSamples = tickets
        .filter((ticket) => ticket.claimedAt && ticket.createdAt)
        .map((ticket) => ticket.claimedAt - ticket.createdAt);

    const closeSamples = tickets
        .filter((ticket) => ticket.closedAt && ticket.createdAt)
        .map((ticket) => ticket.closedAt - ticket.createdAt);

    const staffActivityMap = new Map();
    for (const activity of activities) {
        if (!activity.actorId) {
            continue;
        }

        const current = staffActivityMap.get(activity.actorId) || {
            actorId: activity.actorId,
            total: 0,
            claimed: 0,
            closed: 0,
            transferred: 0
        };

        current.total += 1;
        if (activity.type === 'ticket_claimed') current.claimed += 1;
        if (activity.type === 'ticket_closed') current.closed += 1;
        if (activity.type === 'ticket_transferred') current.transferred += 1;

        staffActivityMap.set(activity.actorId, current);
    }

    const avg = (samples) => samples.length > 0
        ? Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length)
        : null;

    return {
        totalTickets,
        openTickets,
        closedTickets,
        transferredTickets,
        claimedTickets,
        activityCount: activities.length,
        response: {
            averageFirstClaimMs: avg(firstResponseSamples),
            averageCloseMs: avg(closeSamples)
        },
        staffActivity: Array.from(staffActivityMap.values()).sort((left, right) => right.total - left.total).slice(0, 8)
    };
}

function ensureAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    return next();
}

function ensureGuildAccess(client) {
    return async (req, res, next) => {
        const guildId = req.params.guildId;
        const allowedGuild = (req.session.adminGuilds || []).find((guild) => guild.id === guildId);
        const botGuild = client.guilds.cache.get(guildId);

        if (!allowedGuild || !botGuild) {
            return res.status(403).json({ error: 'Access denied for this server.' });
        }

        const member = await botGuild.members.fetch(req.session.user.id).catch(() => null);
        
        let tier = null;
        if (botGuild.ownerId === req.session.user.id) {
            tier = 'owner';
        } else if (member) {
            const settings = await db.getGuildConfig(guildId).catch(() => ({})) || {};
            const devRoles = settings.developerRoleIds || [];
            const adminRoles = settings.adminRoleIds || [];
            const modRoles = settings.moderatorRoleIds || [];
            const staffRoles = settings.staffRoleIds || [];
            
            const hasRole = (ids) => ids && ids.length > 0 && member.roles.cache.hasAny(...ids);
            
            if (hasRole(devRoles)) tier = 'developer';
            else if (member.permissions.has('Administrator') || hasRole(adminRoles)) tier = 'admin';
            else if (hasRole(modRoles)) tier = 'moderator';
            else if (hasRole(staffRoles)) tier = 'staff';
            else tier = 'member';
        }

        if (!tier) {
            return res.status(403).json({ error: 'Your server permissions no longer allow dashboard access.' });
        }

        allowedGuild.dashboardTier = tier;
        req.dashboardGuild = botGuild;
        req.allowedGuild = allowedGuild;
        return next();
    };
}

async function createDashboardSnapshot(client, guildId) {
    const guild = client.guilds.cache.get(guildId);
    await guild.members.fetch({ user: guild.ownerId }).catch(() => {});
    await db.backfillTicketGuildIds(client, guildId);

    const [guildConfig, tickets, activities, audits] = await Promise.all([
        db.getGuildConfig(guildId),
        db.listTicketsByGuild(guildId, 300),
        db.listActivityLogs(guildId, 120),
        db.listAuditLogs(guildId, 120)
    ]);

    const mappedTickets = tickets.map((ticket) => mapTicketRecord(ticket, client, guild, guildConfig));
    const mappedActivities = activities.map((activity) => mapActivityRecord(activity, client, guild));
    const mappedAudits = audits.map((audit) => mapAuditRecord(audit, client, guild));
    const stats = computeStats(mappedTickets, mappedActivities);

    const typeBreakdown = guildConfig.ticketOptions.map((option) => ({
        value: option.value,
        label: option.label,
        count: mappedTickets.filter((ticket) => ticket.type === option.value).length
    }));

    const textChannels = guild.channels.cache
        .filter((channel) => [ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type))
        .sort((left, right) => left.rawPosition - right.rawPosition)
        .map(summarizeChannel);

    const panelChannels = guild.channels.cache
        .filter((channel) => channel.type === ChannelType.GuildText)
        .sort((left, right) => left.rawPosition - right.rawPosition)
        .map(summarizeChannel);

    const categoryChannels = guild.channels.cache
        .filter((channel) => channel.type === ChannelType.GuildCategory)
        .sort((left, right) => left.rawPosition - right.rawPosition)
        .map(summarizeChannel);

    const roles = guild.roles.cache
        .filter((role) => role.name !== '@everyone')
        .sort((left, right) => right.position - left.position)
        .map(summarizeRole);

    const owner = summarizeUser(client, guild, guild.ownerId);
    const adminRoles = roles.filter((role) => role.isAdmin);

    return {
        guild: {
            id: guild.id,
            name: guild.name,
            iconUrl: guild.iconURL({ size: 256 }),
            owner,
            memberCount: guild.memberCount
        },
        bot: {
            id: client.user.id,
            username: client.user.username,
            avatarUrl: client.user.displayAvatarURL({ size: 128 }),
            uptimeMs: client.uptime,
            guildCount: client.guilds.cache.size,
            nickname: guild.members.cache.get(client.user.id)?.nickname || ''
        },
        settings: guildConfig,
        resources: {
            textChannels,
            panelChannels,
            categoryChannels,
            roles,
            adminRoles
        },
        stats,
        tickets: mappedTickets,
        activities: mappedActivities,
        audits: mappedAudits,
        analytics: {
            dailyTickets: computeDailySeries(mappedTickets, 7),
            typeBreakdown,
            statusBreakdown: [
                { label: 'Open', value: stats.openTickets },
                { label: 'Closed', value: stats.closedTickets }
            ]
        }
    };
}

async function initDashboard(client) {
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    const sessionMiddleware = session({
        secret: process.env.SESSION_SECRET || 'syncink_super_secret_dash',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: 'lax',
            secure: false
        }
    });

    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json({ limit: '1mb' }));
    app.use(sessionMiddleware);
    setSocketServer(io);
    client.io = io;

    io.engine.use((req, _res, next) => {
        sessionMiddleware(req, {}, next);
    });

    io.on('connection', (socket) => {
        const sessionUser = socket.request.session?.user;
        if (!sessionUser) {
            socket.disconnect();
            return;
        }

        socket.on('guild:subscribe', (guildId) => {
            const allowedGuilds = socket.request.session?.adminGuilds || [];
            const hasAccess = allowedGuilds.some((guild) => guild.id === guildId) && client.guilds.cache.has(guildId);
            if (hasAccess) {
                socket.join(`guild:${guildId}`);
            }
        });
    });

    app.get('/api/auth/login', (req, res) => {
        const clientId = process.env.DISCORD_CLIENT_ID || client.user.id;
        const redirectUri = encodeURIComponent(
            process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
        );
        const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`;
        res.redirect(url);
    });

    app.get('/api/auth/callback', async (req, res) => {
        if (!req.query.code) {
            return res.redirect('/login');
        }

        try {
            const tokenResponse = await axios.post(
                'https://discord.com/api/oauth2/token',
                new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID || client.user.id,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code: req.query.code,
                    redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            );

            const accessToken = tokenResponse.data.access_token;
            const [userResponse, guildsResponse] = await Promise.all([
                axios.get('https://discord.com/api/users/@me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }),
                axios.get('https://discord.com/api/users/@me/guilds', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            ]);

            const allSharedGuilds = guildsResponse.data.filter((guild) => client.guilds.cache.has(guild.id));
            const adminGuilds = [];

            for (const guild of allSharedGuilds) {
                try {
                    const clientGuild = client.guilds.cache.get(guild.id);
                    if (!clientGuild) continue;

                    let tier = null;
                    if (guild.owner) {
                        tier = 'owner';
                    } else {
                        const member = await clientGuild.members.fetch(userResponse.data.id).catch(() => null);
                        if (member) {
                            const settings = await db.getGuildConfig(guild.id).catch(() => ({})) || {};
                            
                            const devRoles = settings.developerRoleIds || [];
                            const adminRoles = settings.adminRoleIds || [];
                            const modRoles = settings.moderatorRoleIds || [];
                            const staffRoles = settings.staffRoleIds || [];
                            
                            const hasRole = (ids) => ids && ids.length > 0 && member.roles.cache.hasAny(...ids);
                            
                            if (hasRole(devRoles)) tier = 'developer';
                            else if ((BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8) || hasRole(adminRoles)) tier = 'admin';
                            else if (hasRole(modRoles)) tier = 'moderator';
                            else if (hasRole(staffRoles)) tier = 'staff';
                            else tier = 'member';
                        }
                    }

                    if (tier) {
                        adminGuilds.push({
                            id: guild.id,
                            name: guild.name,
                            icon: guild.icon,
                            owner: guild.owner,
                            permissions: guild.permissions,
                            dashboardTier: tier
                        });
                    }
                } catch (err) {
                    console.error('Error evaluating guild tier:', err);
                }
            }

            req.session.user = userResponse.data;
            req.session.adminGuilds = adminGuilds;
            req.session.accessToken = accessToken;

            return res.redirect('/servers');
        } catch (error) {
            console.error('[DASHBOARD AUTH ERROR]', error.response?.data || error.message);
            return res.redirect('/login?error=auth_failed');
        }
    });

    app.get('/api/auth/me', ensureAuthenticated, async (req, res) => {
        const guilds = (req.session.adminGuilds || []).filter(g => client.guilds.cache.has(g.id));
        
        for (const guild of guilds) {
            if (!guild.dashboardTier) {
                const botGuild = client.guilds.cache.get(guild.id);
                if (botGuild.ownerId === req.session.user.id) {
                    guild.dashboardTier = 'owner';
                } else {
                    const member = await botGuild.members.fetch(req.session.user.id).catch(() => null);
                    if (member && member.permissions.has('Administrator')) {
                        guild.dashboardTier = 'admin';
                    } else {
                        guild.dashboardTier = 'member';
                    }
                }
            }
        }
        
        res.json({
            user: req.session.user,
            guilds
        });
    });

    app.get('/api/auth/logout', (req, res) => {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    });

    app.get('/api/reviews', async (req, res) => {
        try {
            const reviews = await db.listReviews(50);
            res.json(reviews);
        } catch (error) {
            console.error('[REVIEWS] Failed to fetch reviews:', error);
            res.status(500).json({ error: 'Failed to load reviews.' });
        }
    });

    app.post('/api/reviews', ensureAuthenticated, async (req, res) => {
        try {
            const { rating, content } = req.body;
            if (!rating || !content) return res.status(400).json({ error: 'Rating and content are required.' });

            let highestTier = null;
            let highestTierGuildName = null;
            let maxScore = -1;

            const TIER_LEVELS = {
                owner: 5,
                developer: 4,
                admin: 3,
                moderator: 2,
                staff: 1,
                member: 0
            };

            const userGuilds = req.session.adminGuilds || [];
            for (const sessionGuild of userGuilds) {
                const botGuild = client.guilds.cache.get(sessionGuild.id);
                if (!botGuild) continue;

                const member = await botGuild.members.fetch(req.session.user.id).catch(() => null);
                if (!member) continue;

                const settings = await db.getGuildConfig(botGuild.id).catch(() => ({})) || {};
                let currentTier = 'member';

                if (botGuild.ownerId === req.session.user.id) {
                    currentTier = 'owner';
                } else {
                    const devRoles = settings.developerRoleIds || [];
                    const adminRoles = settings.adminRoleIds || [];
                    const modRoles = settings.moderatorRoleIds || [];
                    const staffRoles = settings.staffRoleIds || [];

                    const hasRole = (roleIds) => roleIds.some(id => member.roles.cache.has(id));

                    if (hasRole(devRoles)) currentTier = 'developer';
                    else if (member.permissions.has('Administrator') || hasRole(adminRoles)) currentTier = 'admin';
                    else if (hasRole(modRoles)) currentTier = 'moderator';
                    else if (hasRole(staffRoles)) currentTier = 'staff';
                }

                const score = TIER_LEVELS[currentTier] || 0;
                if (score > maxScore) {
                    maxScore = score;
                    highestTier = currentTier;
                    highestTierGuildName = botGuild.name;
                }
            }

            const review = await db.createReview({
                userId: req.session.user.id,
                username: req.session.user.username,
                globalName: req.session.user.global_name,
                avatar: req.session.user.avatar,
                highestTier,
                highestTierGuildName,
                rating,
                content
            });

            res.json(review);
        } catch (error) {
            console.error('[REVIEWS] Failed to post review:', error);
            res.status(500).json({ error: 'Failed to submit review.' });
        }
    });

    app.get('/api/fix-reviews', async (req, res) => {
        try {
            const Review = db.getReviewModel();
            await Review.updateMany(
                { highestTier: 'member', highestTierGuildName: 'FU3CKER PLACE' },
                { $set: { highestTier: 'developer' } }
            );
            res.send('Fixed successfully! You can go back to the dashboard now.');
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

    app.get('/api/guilds/:guildId/bootstrap', ensureAuthenticated, ensureGuildAccess(client), async (req, res) => {
        try {
            const snapshot = await createDashboardSnapshot(client, req.params.guildId);
            snapshot.userTier = req.allowedGuild.dashboardTier;
            res.json(snapshot);
        } catch (error) {
            console.error('[DASHBOARD] Failed to build snapshot:', error);
            res.status(500).json({ error: 'Failed to load dashboard data.' });
        }
    });

    const TIER_LEVELS = {
        owner: 5,
        developer: 4,
        admin: 3,
        moderator: 2,
        staff: 1,
        member: 0
    };

    function hasPermission(userTier, requiredTier) {
        return (TIER_LEVELS[userTier] || 0) >= TIER_LEVELS[requiredTier];
    }

    app.patch('/api/guilds/:guildId/settings', ensureAuthenticated, ensureGuildAccess(client), async (req, res) => {
        try {
            const userTier = req.allowedGuild.dashboardTier;
            
            if (!hasPermission(userTier, 'admin')) {
                return res.status(403).json({ error: 'You do not have permission to modify settings.' });
            }

            let allowedKeys = [
                'ticketCategoryId',
                'logChannelId',
                'transcriptChannelId',
                'panelChannelId',
                'inactivityReminderMinutes',
                'panelConfig',
                'defaultTicketMessages',
                'dashboardPreferences',
                'categoryOverrides'
            ];

            // Only owners and developers can modify role mappings
            if (hasPermission(userTier, 'developer')) {
                allowedKeys.push(
                    'staffRoleIds',
                    'adminRoleIds',
                    'ownerRoleIds',
                    'developerRoleIds',
                    'moderatorRoleIds'
                );
            }

            const updateData = Object.fromEntries(
                Object.entries(req.body || {}).filter(([key]) => allowedKeys.includes(key))
            );

            if (Object.keys(updateData).length === 0) {
                // If they tried to update restricted fields, do nothing but return 200 (graceful fail)
                const snapshot = await createDashboardSnapshot(client, req.params.guildId);
                return res.json(snapshot);
            }

            const previousConfig = await db.getGuildConfig(req.params.guildId);
            const nextConfig = await db.updateGuildConfig(req.params.guildId, updateData);
            const changes = buildAuditChanges(previousConfig, nextConfig, updateData);

            if (changes.length > 0) {
                await db.createAuditLog({
                    guildId: req.params.guildId,
                    actorId: req.session.user.id,
                    actorTag: req.session.user.username,
                    source: 'dashboard',
                    action: 'Updated dashboard settings',
                    changes
                });
            }

            const snapshot = await createDashboardSnapshot(client, req.params.guildId);
            res.json(snapshot);
        } catch (error) {
            console.error('[DASHBOARD] Failed to update settings:', error);
            res.status(500).json({ error: 'Failed to save settings.' });
        }
    });

    app.post('/api/guilds/:guildId/panel/deploy', ensureAuthenticated, ensureGuildAccess(client), async (req, res) => {
        try {
            const userTier = req.allowedGuild.dashboardTier;
            if (!hasPermission(userTier, 'admin')) {
                return res.status(403).json({ error: 'You do not have permission to deploy panels.' });
            }

            const guild = req.dashboardGuild;
            const targetChannelId = req.body?.channelId;
            const targetChannel = guild.channels.cache.get(targetChannelId);

            if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
                return res.status(400).json({ error: 'Choose a standard text channel for the ticket panel.' });
            }

            const previousConfig = await db.getGuildConfig(req.params.guildId);
            await sendConfiguredTicketPanel(targetChannel);
            await db.updateGuildConfig(req.params.guildId, {
                panelChannelId: targetChannel.id
            });

            await db.createAuditLog({
                guildId: req.params.guildId,
                actorId: req.session.user.id,
                actorTag: req.session.user.username,
                source: 'dashboard',
                action: 'Deployed ticket panel',
                changes: [{
                    field: 'panelChannelId',
                    before: previousConfig.panelChannelId,
                    after: targetChannel.id
                }]
            });

            await db.createActivityLog({
                guildId: req.params.guildId,
                type: 'panel_deployed',
                title: 'Ticket panel deployed',
                description: `${req.session.user.username} deployed the panel in #${targetChannel.name}.`,
                actorId: req.session.user.id,
                actorTag: req.session.user.username,
                metadata: {
                    channelId: targetChannel.id
                }
            });

            const snapshot = await createDashboardSnapshot(client, req.params.guildId);
            res.json(snapshot);
        } catch (error) {
            console.error('[DASHBOARD] Failed to deploy panel:', error);
            res.status(500).json({ error: 'Failed to deploy the ticket panel.' });
        }
    });

    app.post('/api/guilds/:guildId/nickname', ensureAuthenticated, ensureGuildAccess(client), async (req, res) => {
        try {
            const userTier = req.allowedGuild.dashboardTier;
            if (!hasPermission(userTier, 'developer')) {
                return res.status(403).json({ error: 'Only Owners and Developers can change the bot nickname.' });
            }

            const nickname = req.body?.nickname || '';
            const guild = req.dashboardGuild;
            const botMember = guild.members.cache.get(client.user.id);
            if (!botMember) {
                return res.status(400).json({ error: 'Bot is not in this server.' });
            }
            await botMember.setNickname(nickname || null);

            await db.createAuditLog({
                guildId: req.params.guildId,
                actorId: req.session.user.id,
                actorTag: req.session.user.username,
                action: 'Changed bot nickname',
                changes: [{ field: 'botNickname', before: botMember.nickname, after: nickname || null }]
            });

            const snapshot = await createDashboardSnapshot(client, req.params.guildId);
            res.json(snapshot);
        } catch (error) {
            console.error('[DASHBOARD] Failed to change nickname:', error);
            res.status(500).json({ error: 'Failed to change the bot nickname.' });
        }
    });

    app.use(express.static(path.join(__dirname, '../dashboard/dist')));
    app.use((req, res) => {
        try {
            res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'));
        } catch (error) {
            res.status(500).send('Dashboard is still building or failed to compile. Check build logs.');
        }
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`[DASHBOARD] Web server & WebSockets running on port ${PORT}`);
    });
}

module.exports = { initDashboard };
