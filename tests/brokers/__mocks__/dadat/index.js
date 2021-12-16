export const buySamples = [
  require('./portfolio_transactions/buy/buy_sample_0.json'),
  require('./portfolio_transactions/buy/buy_sample_1_usd.json'),
];

export const sellSamples = [
  require('./portfolio_transactions/sell/sell_sample_0.json'),
  require('./portfolio_transactions/sell/sell_sample_1_usd.json'),
];

export const dividendSamples = [
  require('./portfolio_transactions/dividend/dividend_sample_0.json'),
  require('./portfolio_transactions/dividend/dividend_sample_1.json'),
];

export const manualTest = [
  require('./portfolio_transactions/portfolio_3821.json'),
];

export const allSamples = buySamples.concat(
  sellSamples,
  dividendSamples,
  manualTest
);
