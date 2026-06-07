# SyncInk Tickets 🎫

A standalone Node.js Discord bot that handles advanced Ticket Threads, Transcripts, and Server Logging (Messages & Voice).

## Prerequisites
- **Node.js v16.11.0 or higher**
- A new Discord Bot Token from the [Developer Portal](https://discord.com/developers/applications).

## Setup
1. Clone or download this project.
2. In the `d:/syncink ticket bot/` directory, open your terminal.
3. Run `npm install` to install dependencies.
4. Ensure your `.env` file contains your Bot Token: `DISCORD_TOKEN=your_token_here`
5. Run `node src/index.js` to start the bot!

## Discord Developer Portal Settings
**CRITICAL**: You must enable the following **Privileged Gateway Intents** for this bot to work:
- Server Members Intent
- Message Content Intent

## Commands
- `/ticket-panel` - Spawns the ticket creation panel
- `/ticket-config category category:<#channel>` - Sets where tickets are opened
- `/server-logs tickets` - Sets ticket transcript logs channel
- `/server-logs messages` - Sets message edit logs channel
- `/server-logs voice` - Sets voice join/leave logs channel
