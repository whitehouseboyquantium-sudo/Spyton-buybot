require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const detectStonFiBuys = require('./detectors/stonfi');
const detectDeDustBuys = require('./detectors/dedust');

// ======================
// ENV
// ======================
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('❌ Missing BOT_TOKEN or CHANNEL_ID in .env');
  process.exit(1);
}

// ======================
// TELEGRAM BOT
// ======================
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ======================
// STORAGE
// ======================
const dataDir = path.join(__dirname, 'data');
const tokensPath = path.join(dataDir, 'tokens.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(tokensPath)) fs.writeFileSync(tokensPath, '{}');

const loadTokens = () =>
  JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

const saveTokens = (tokens) =>
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));

// ======================
// BUY MESSAGE
// ======================
function postBuyAlert({
  symbol,
  ton,
  usd,
  wallet,
  txHash,
  position,
  marketCap,
  liquidity,
  rank
}) {
  const msg =
`TON TRENDING
🟢 ${symbol}

${symbol} Buy!
🟢🟢🟢🟢🟢🟢🟢🟢

💰 ${ton} TON ($${usd})
👤 ${wallet} | Txn
⬆ Position: ${position}
🏆 Market Cap: $${marketCap ?? '—'}
💧 Liquidity: $${liquidity ?? '—'}

📊 Chart | 🔥 Trending | 🆕 Pools
🟢 #${rank ?? 1} On SpyTON Trending`;

  bot.sendMessage(CHANNEL_ID, msg, { disable_web_page_preview: true });
}

// ======================
// COMMANDS
// ======================
bot.onText(/\/addtoken (\S+) (\S+) (\S+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const [, symbol, pool, telegram] = match;

  const tokens = loadTokens();

  tokens[symbol] = {
    symbol,
    pool,
    telegram,
    addedAt: Date.now()
  };

  saveTokens(tokens);

  bot.sendMessage(
    chatId,
    `✅ ${symbol} added\nPool: ${pool}`
  );
});

bot.onText(/\/forcetrend (\S+) (\d+) (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const [, symbol, rank, hours] = match;

  const tokens = loadTokens();
  if (!tokens[symbol]) {
    bot.sendMessage(chatId, `❌ ${symbol} not found`);
    return;
  }

  tokens[symbol].forcedRank = Number(rank);
  tokens[symbol].forceUntil = Date.now() + Number(hours) * 3600000;
  saveTokens(tokens);

  bot.sendMessage(
    chatId,
    `🔥 ${symbol} forced to #${rank} for ${hours}h`
  );
});

// ======================
// DETECTORS LOOP
// ======================
async function runDetectors() {
  try {
    const tokens = loadTokens();
    await detectStonFiBuys(tokens, postBuyAlert);
    await detectDeDustBuys(tokens, postBuyAlert);
  } catch (e) {
    console.error('Detector error:', e.message);
  }
}

setInterval(runDetectors, 10_000);

// ======================
console.log('✅ SpyTON BuyBot running');