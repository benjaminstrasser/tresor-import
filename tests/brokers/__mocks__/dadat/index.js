export const accountDepotAccountTransactions = [
  require('./account-depot/accountTransactions/sample_3775.json'),
];

export const servicePortfolioTransactions = [
  require('./service/portfolioTransactions/buy_sample_0.json'),
  require('./service/portfolioTransactions/buy_sample_1_usd.json'),
  require('./service/portfolioTransactions/dividend_sample_0.json'),
  require('./service/portfolioTransactions/dividend_sample_1.json'),
  require('./service/portfolioTransactions/sell_sample_0.json'),
  require('./service/portfolioTransactions/sell_sample_1_usd.json'),
];

export const accountDepotPortfolioTransactions = [
  require('./account-depot/protfolioTransactions/sample_3776.json'),
  require('./account-depot/protfolioTransactions/sample_3891.json'),
  require('./account-depot/protfolioTransactions/sample_4446.json'),
  require('./account-depot/protfolioTransactions/sample_0.json'),
];

export const allSamples = servicePortfolioTransactions.concat(
  accountDepotPortfolioTransactions,
  accountDepotAccountTransactions
);
