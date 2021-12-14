import {
  createActivityDateTime,
  parseGermanNum,
  validateActivity,
} from '@/helper';

const TRANSACTION_DATE_IDX = 0;
const TRANSACTION_TYPE_IDX = 2;
const TRANSACTION_ISIN_IDX = 5;
const TRANSACTION_COMPANY_IDX = 6;
const TRANSACTION_SHARES_IDX = 7;
const TRANSACTION_PRICE_IDX = 8;
const TRANSACTION_AMOUNT_IDX = 11;
const TRANSACTION_OWN_FEE_IDX = 12;
const TRANSACTION_FOREIGN_FEE_IDX = 13;
const TRANSACTION_TAX_IDX = 15;
const TRANSACTION_FX_RATE_IDX = 17;
const TRANSACTION_FOREIGN_CURRENCY_IDX = 9;

const getType = content => {
  switch (content) {
    case 'Kauf':
      return 'Buy';
    case 'Verkauf':
      return 'Sell';
    case 'Aussch�ttung':
      return 'Dividend';
    default:
      throw new Error('Could not parse type');
  }
};

const parsePortfolioTransactions = contents => {
  const activities = [];
  for (let i = 1; i < contents.length - 1; i++) {
    let content = contents[i].split(';');

    const [date, datetime] = createActivityDateTime(
      content[TRANSACTION_DATE_IDX],
      '12:00', // dadat does not display the time of trades
      'dd.MM.yyyy'
    );
    const activity = {
      broker: 'dadat',
      type: getType(content[TRANSACTION_TYPE_IDX]), // Buy, Sell, Dividend, TransferIn, TransferOut
      date,
      datetime,
      isin: content[TRANSACTION_ISIN_IDX],
      company: content[TRANSACTION_COMPANY_IDX],
      shares: parseGermanNum(content[TRANSACTION_SHARES_IDX]),
      price:
        parseGermanNum(content[TRANSACTION_PRICE_IDX]) /
        parseGermanNum(content[TRANSACTION_FX_RATE_IDX]),
      amount: parseGermanNum(content[TRANSACTION_AMOUNT_IDX]),
      fee:
        parseGermanNum(content[TRANSACTION_OWN_FEE_IDX]) +
        parseGermanNum(content[TRANSACTION_FOREIGN_FEE_IDX]),
      tax: parseGermanNum(content[TRANSACTION_TAX_IDX]),
      fxRate: parseGermanNum(content[TRANSACTION_FX_RATE_IDX]),
      foreignCurrency: content[TRANSACTION_FOREIGN_CURRENCY_IDX],
    };

    if (
      (activity.price * activity.shares).toPrecision(2) !==
      activity.amount.toPrecision(2)
    ) {
      console.error(
        'Constraint price * shares = amount not fullfilled for activity: ' +
          activity
      );
      continue;
    }

    if (activity.foreignCurrency === 'EUR') {
      delete activity.foreignCurrency;
      delete activity.fxRate;
    }

    activities.push(validateActivity(activity));
  }

  return activities;
};

const getDocumentType = content => {
  if (
    content[0].includes(
      'Handelsdatum;Valutadatum;Transaktion;Instrumentenart;WP-Identifikationsart'
    )
  ) {
    return 'PortfolioTransactions';
  }
  return undefined;
};

export const parsePages = contents => {
  contents = contents.flat();

  const documentType = getDocumentType(contents);
  switch (documentType) {
    // This type of file contains Dividends and other information. Only dividends are processed. This is not implemented
    // yet as the dividends lack the information how many shares are in the account
    case 'PortfolioTransactions':
      return {
        activities: parsePortfolioTransactions(contents),
        status: 0,
      };
    case 'Ignored':
      return {
        activities: [],
        status: 7,
      };
  }
};

export const canParseDocument = (pages, extension) => {
  pages = pages.flat();

  return extension === 'csv' && getDocumentType(pages) !== undefined;
};

export const parsingIsTextBased = () => true;
