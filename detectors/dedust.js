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

const dedustApiUrl = 'https://api.dedust.io/v1/pools'; // Sample DeDust API endpoint

const detectDeDustBuys = async (postBuyAlert) => {
  try {
    const { data } = await axios.get(dedustApiUrl);

    for (const pool of data.pools) {
      // Poll for swap events within the pool
      const swaps = pool.swaps?.filter((swap) => swap.type === 'buy');

      for (const swap of swaps) {
        const { tonAmount, tokenAmount, wallet, txHash } = swap;

        // Ignore already seen transactions
        if (seenTx[txHash]) continue;
        seenTx[txHash] = true;
        saveSeenTx();

        // Call postBuyAlert with extracted data
        postBuyAlert({
          symbol: pool.tokenSymbol,
          ton: tonAmount,
          usd: (tonAmount * pool.tokenPrice).toFixed(2),
          wallet,
          txn: txHash,
          position: 'New Holder', // Example; update as needed
          marketCap: pool.marketCap,
          liquidity: pool.liquidity,
          rank: pool.rank,
        });
      }
    }
  } catch (error) {
    console.error('Error detecting DeDust buys:', error);
  }
};

module.exports = detectDeDustBuys;