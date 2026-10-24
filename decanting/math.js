function batchProfit(buy, sell) {
  const taxEach = Math.min(5000000, Math.floor(sell * 2 / 100));
  return {cost: 2000 * buy, tax: 1500 * taxEach, net: 1500 * (sell - taxEach), profit: 1500 * (sell - taxEach) - 2000 * buy};
}
if (typeof module !== 'undefined') module.exports = {batchProfit};
