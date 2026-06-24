const { EventEmitter } = require('events');

const realtimeEmitter = new EventEmitter();
let socketServer = null;

function setSocketServer(io) {
    socketServer = io;
}

function emitGuildEvent(guildId, type, payload = {}) {
    const event = {
        guildId,
        type,
        timestamp: Date.now(),
        ...payload
    };

    realtimeEmitter.emit('dashboard:event', event);

    if (socketServer && guildId) {
        socketServer.to(`guild:${guildId}`).emit('dashboard:event', event);
    }

    return event;
}

module.exports = {
    realtimeEmitter,
    setSocketServer,
    emitGuildEvent
};
