require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const detectStonFiBuys = require('./detectors/stonfi');
const detectDeDustBuys = require('./detectors/dedust');

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const CHANNEL_ID = process.env.CHANNEL_ID;

// Helper function to post buy alerts
const postBuyAlert = ({ symbol, ton, usd, wallet, txn, position, marketCap, liquidity, rank }) => {
  const message = `TON TRENDING\n🟢 ${symbol}\n\n${symbol} Buy!\n🟢🟢🟢🟢🟢🟢🟢🟢\n\n💰 ${ton} TON ($${usd})\n👤 ${wallet} | Txn: ${txn}\n⬆ Position: ${position}\n🏆 Market Cap: $${marketCap}\n💧 Liquidity: $${liquidity}\n\n📊 Chart | 🔥 Trending | 🆕 Pools\n🟢 #${rank} On SpyTON Trending`;
  
  bot.sendMessage(CHANNEL_ID, message);
};

// Command handlers
bot.onText(/\/addtoken (.+) (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const [_, symbol, poolAddress, telegramLink] = match;
  // Handle adding a new token
  bot.sendMessage(chatId, `Token ${symbol} added successfully!`);
});

bot.onText(/\/forcetrend (\S+) (\d+) (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const [_, symbol, rank, time] = match;
  // Handle force trending logic
  bot.sendMessage(chatId, `Token ${symbol} set to force trend at rank: #${rank} for ${time} hours.`);
});

// Shared interval for detecting buy events
total =()=>{   setTimeout(async()=>{ const trigger_all_interval=()=>void detectStonFiBuys(New. PostAdd)}，将addEntry.