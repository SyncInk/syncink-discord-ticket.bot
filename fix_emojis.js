const fs = require('fs');
let content = fs.readFileSync('src/utils/ticketUtils.js', 'utf8');

// Replace any characters inside setEmoji()
content = content.replace(/\.setCustomId\('ticket_btn_close'\)\s*\.setLabel\('Close'\)\s*\.setStyle\(ButtonStyle\.Danger\)\s*\.setEmoji\([^)]+\);/g, 
  ".setCustomId('ticket_btn_close')\n                .setLabel('Close')\n                .setStyle(ButtonStyle.Danger)\n                .setEmoji('\uD83D\uDD12');");

content = content.replace(/\.setCustomId\('ticket_btn_transfer'\)\s*\.setLabel\('Transfer'\)\s*\.setStyle\(ButtonStyle\.Secondary\)\s*\.setEmoji\([^)]+\);/g, 
  ".setCustomId('ticket_btn_transfer')\n                .setLabel('Transfer')\n                .setStyle(ButtonStyle.Secondary)\n                .setEmoji('\uD83D\uDD04');");

content = content.replace(/\.setCustomId\('ticket_btn_claim'\)\s*\.setLabel\('Claim'\)\s*\.setStyle\(ButtonStyle\.Success\)\s*\.setEmoji\([^)]+\);/g, 
  ".setCustomId('ticket_btn_claim')\n                .setLabel('Claim')\n                .setStyle(ButtonStyle.Success)\n                .setEmoji('\uD83D\uDE4B');");

fs.writeFileSync('src/utils/ticketUtils.js', content, 'utf8');
console.log('Fixed emojis in ticketUtils.js');
