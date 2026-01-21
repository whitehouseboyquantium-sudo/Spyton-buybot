require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const tokensFilePath = path.resolve(__dirname, 'data', 'tokens.json');

// Load tokens from file
let tokens = {};
if (fs.existsSync(tokensFilePath)) {
  tokens = JSON.parse(fs.readFileSync(tokensFilePath));
}

// Buy detection functions (STON.fi and DeDust)
const detectStonFiBuys = () => {
  console.log('STON.fi buy detection not implemented yet.\n');
}; // Placeholder for STON.fi detection logic

const detectDeDustBuys = () => {
  if (process.env.DEDUST_API_KEY) {
    console.log('DeDust buy detection not implemented yet.\n');
  }
}; // Placeholder for DeDust detection logic

// Post buy alerts to Telegram channel
const postBuyAlert = ({ symbol, ton, usd, wallet, txn, position, marketCap, liquidity, rank }) => {
  const message = `TON TRENDING\n🟢 ${symbol}\n\n${symbol} Buy!\n🟢🟢🟢🟢🟢🟢🟢🟢\n\n💰 ${ton} TON ($${usd})\n👤 ${wallet} | ${txn}\n⬆ Position: ${position}\n🏆 Market Cap: $${marketCap}\n💧 Liquidity: $${liquidity}\n\n[ 📊 Chart | 🔥 Trending | 🆕 Pools ]\n\n🟢 #${rank} On SpyTON Trending`;
  bot.sendMessage(process.env.CHANNEL_ID, message);
};

// Command handlers
bot.onText(/\/addtoken (.+) (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const [_, symbol, poolAddress, telegramLink] = match;

  if (tokens[symbol]) {
    bot.sendMessage(chatId, `Token ${symbol} is already added.`);
    return;
  }
  
tokens[symbol] = { poolAddress, telegramLink };
  fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));
  bot.sendMessage(chatId, `Token ${symbol} added successfully!`);
});

bot.onText(/\/forcetrend (\S+) (\d+) (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const [_, symbol, rank, time] = match;

  if (!tokens[symbol]) {
    bot.sendMessage(chatId, `Token ${symbol} not found. Use /addtoken to add it first.`);
    return;
  }

  bot.sendMessage(chatId, `Token ${symbol} set to force trend at rank: #${rank} for ${time} hours.`);
});

// Periodic job for buy detection
setInterval(() => {
  detectStonFiBuys();
  detectDeDustBuys();
}, 10000); // Interval set to 10 seconds as a placeholder

console.log('Telegram buy bot for TON blockchain is running...');
