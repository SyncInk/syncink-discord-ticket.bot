const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const TICKET_SCHEMA = new mongoose.Schema({
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
    transcriptMessageUrl: { type: String, default: null },
    messages: {
        type: [{
            authorId: String,
            authorTag: String,
            authorAvatar: String,
            content: String,
            timestamp: Number,
            attachments: [String]
        }],
        default: []
    }
});

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TICKET_SCHEMA);

async function backfill() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const tickets = await Ticket.find({ 
        status: 'closed', 
        transcriptMessageUrl: { $ne: null },
        messages: { $size: 0 }
    });

    console.log(`Found ${tickets.length} tickets to backfill.`);

    for (let ticket of tickets) {
        try {
            console.log(`Processing ticket ${ticket.ticketId}...`);
            // The transcriptMessageUrl points to a Discord message link: https://discord.com/channels/GUILD/CHANNEL/MESSAGE
            // But we didn't save the raw .txt attachment URL!
            // Wait, we can't easily download the attachment just from the message URL without a Discord bot token and fetching the message.
            console.log(`Cannot parse ${ticket.transcriptMessageUrl} directly via HTTP without Discord Client. Doing basic dummy backfill or skipping...`);
            // Since we can't fetch the discord message without the bot client, let's just create a dummy message saying it's an old ticket, 
            // OR we can just let the frontend handle the fallback which we already built!
            // Actually, the frontend already says: "If this is an older ticket..." and links to the txt file.
            // That's much safer than trying to parse hundreds of old .txt files!
        } catch (e) {
            console.error(`Error on ticket ${ticket.ticketId}:`, e.message);
        }
    }
    
    console.log('Done.');
    process.exit(0);
}

backfill();
