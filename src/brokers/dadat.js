import {
  createActivityDateTime,
  parseGermanNum,
  validateActivity,
} from '@/helper';

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

const getForeignCurrency = (price, shares, amount) => {
  return (price * shares) / amount;
};

const parseServicePortfolioTransactions = contents => {
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

const parseAccountDepotPortfolioTransactions = contents => {
  const TRANSACTION_DATE_IDX = 0;
  const TRANSACTION_TYPE_IDX = 16;
  const TRANSACTION_ISIN_IDX = 3;
  const TRANSACTION_COMPANY_IDX = 2;
  const TRANSACTION_SHARES_IDX = 4;
  const TRANSACTION_PRICE_IDX = 6;
  const TRANSACTION_AMOUNT_IDX = 12;
  const TRANSACTION_FEE_IDX = 8;
  const TRANSACTION_TAX_IDX = 10;
  const TRANSACTION_FOREIGN_CURRENCY_IDX = 7;

  const activities = [];
  for (let i = 6; i < contents.length; i++) {
    let content = contents[i].split(';');

    const [date, datetime] = createActivityDateTime(
      content[TRANSACTION_DATE_IDX],
      '12:00', // dadat does not display the time of trades
      'dd.MM.yyyy'
    );

    const shares = parseGermanNum(content[TRANSACTION_SHARES_IDX]);
    const priceInPotentialForeignCurrency = parseGermanNum(
      content[TRANSACTION_PRICE_IDX]
    );
    const amount = parseGermanNum(content[TRANSACTION_AMOUNT_IDX]);
    let foreignCurrency = content[TRANSACTION_FOREIGN_CURRENCY_IDX];

    if (amount === 0) {
      foreignCurrency = 'EUR';
    }

    let foreignCurrencyConversion;
    if (foreignCurrency.includes('EUR')) {
      foreignCurrencyConversion = 1;
    } else {
      foreignCurrencyConversion = getForeignCurrency(
        priceInPotentialForeignCurrency,
        shares,
        amount
      );
    }

    const activity = {
      broker: 'dadat',
      type: getType(content[TRANSACTION_TYPE_IDX]), // Buy, Sell, Dividend, TransferIn, TransferOut
      date,
      datetime,
      isin: content[TRANSACTION_ISIN_IDX],
      company: content[TRANSACTION_COMPANY_IDX],
      shares,
      price: priceInPotentialForeignCurrency / foreignCurrencyConversion,
      amount,
      fee: parseGermanNum(content[TRANSACTION_FEE_IDX]),
      tax: parseGermanNum(content[TRANSACTION_TAX_IDX]),
      fxRate: foreignCurrencyConversion,
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
    return 'Service-PortfolioTransactions';
  } else if (content[0].includes('Depotums�tze')) {
    return 'AccountDepot-PortfolioTransactions';
  } else if (content[0].includes('Kontoums�tze')) {
    return 'AccountDepot-AccountTransactions';
  } else if (
    content[0].includes(
      'Handelsdatum;Valutadatum;Transaktion;Instrumentenart;WP-Identifikationsart;WP-Identifikation;WP-Name;Nominale / St�ck;Kurs / Limit'
    )
  ) {
    return 'Service-AccountTransactions';
  }
  return undefined;
};

export const parsePages = contents => {
  contents = contents.flat();

  const documentType = getDocumentType(contents);
  switch (documentType) {
    case 'Service-PortfolioTransactions':
      return {
        activities: parseServicePortfolioTransactions(contents),
        status: 0,
      };
    case 'AccountDepot-PortfolioTransactions':
      return {
        activities: parseAccountDepotPortfolioTransactions(contents),
        status: 0,
      };
    default:
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
