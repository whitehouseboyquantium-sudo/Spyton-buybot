const axios = require('axios');
const fs = require('fs');
const path = require('path');

const seenTxPath = path.resolve(__dirname, '../data', 'seenTx.json');
let seenTx = {};
if (fs.existsSync(seenTxPath)) {
  seenTx = JSON.parse(fs.readFileSync(seenTxPath));
}

const saveSeenTx = () => {
  fs.writeFileSync(seenTxPath, JSON.stringify(seenTx, null, 2));
};

const stonfiApiUrl = 'https://api.ston.fi/v1/swaps'; // Placeholder for actual STON.fi API endpoint

const detectStonFiBuys = async (postBuyAlert) => {
  try {
    const { data } = await axios.get(stonfiApiUrl);

    for (const swap of data.swaps) {
      // Detect BUY swaps only
      if (swap.type !== 'buy') continue;

      const { tokenSymbol: symbol, tonAmount, tokenAmount, buyer: wallet, txHash } = swap;

      // Ignore already seen transactions
      if (seenTx[txHash]) continue;
      seenTx[txHash] = true;
      saveSeenTx();

      // Call postBuyAlert with extracted data
      postBuyAlert({
        symbol,
        ton: tonAmount,
        usd: (tonAmount * swap.tokenPrice).toFixed(2),
        wallet,
        txn: txHash,
        position: 'New Holder', // Example; update as needed
        marketCap: swap.marketCap,
        liquidity: swap.liquidity,
        rank: swap.rank,
      });
    }
  } catch (error) {
    console.error('Error detecting STON.fi buys:', error);
  }
};

module.exports = detectStonFiBuys;