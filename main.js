const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

console.log('Initializing bot...');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
require('./src/classes/events.js')(client);
require('./src/classes/interactions.js')(client);

client.login(process.env.DICSORD_TOKEN);