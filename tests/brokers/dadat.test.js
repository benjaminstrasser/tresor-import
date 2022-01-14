import { findImplementation } from '@/index';
import * as dadat from '../../src/brokers/dadat';
import {
  servicePortfolioTransactions,
  accountDepotPortfolioTransactions,
  allSamples,
} from './__mocks__/dadat';

describe('Broker: dadat', () => {
  let consoleErrorSpy;

  describe('Check all documents', () => {
    test('Can all pages be parsed with dadat', () => {
      allSamples.forEach(pages => {
        expect(dadat.canParseDocument(pages, 'csv')).toEqual(true);
      });
    });

    test('Can identify a broker from one page as dadat', () => {
      allSamples.forEach(pages => {
        const implementations = findImplementation(pages, 'csv');

        expect(implementations.length).toEqual(1);
        expect(implementations[0]).toEqual(dadat);
      });
    });
  });

  describe('Service: Portfolio Transactions', () => {
    describe('Validate buys', () => {
      test('Can the buy order be parsed', () => {
        const activities = dadat.parsePages(
          servicePortfolioTransactions[0]
        ).activities;
        expect(activities.length).toEqual(1);
        expect(activities[0]).toEqual({
          broker: 'dadat',
          type: 'Buy',
          date: '2021-07-28',
          datetime: '2021-07-28T' + activities[0].datetime.substring(11),
          isin: 'LU1781541179',
          company: 'MUL-Lyx.Cor.MSCI Wld DR U.ETF',
          shares: 190,
          price: 13.072,
          amount: 2483.68,
          fee: 6.6,
          tax: 0,
        });
      });

      test('Can the buy order be parsed wit USD', () => {
        const activities = dadat.parsePages(
          servicePortfolioTransactions[1]
        ).activities;
        expect(activities.length).toEqual(1);
        expect(activities[0]).toEqual({
          broker: 'dadat',
          type: 'Buy',
          date: '2021-05-18',
          datetime: '2021-05-18T' + activities[0].datetime.substring(11),
          isin: 'US69608A1088',
          company: 'PALANTIR TECHNOLOGIES INC',
          shares: 50,
          price: 16.8762,
          amount: 843.81,
          fee: 8.45,
          tax: 0,
          fxRate: 1.2165,
          foreignCurrency: 'USD',
        });
      });
    });

    describe('Validate Sells', () => {
      test('Can the sell order be parsed', () => {
        const activities = dadat.parsePages(
          servicePortfolioTransactions[4]
        ).activities;
        expect(activities.length).toEqual(1);
        expect(activities[0]).toEqual({
          broker: 'dadat',
          type: 'Sell',
          date: '2021-07-07',
          datetime: '2021-07-07T' + activities[0].datetime.substring(11),
          isin: 'IE00B5L01S80',
          company: 'HSBC FTSE EPRA/NAREIT DEVELOPED UCITS ETF',
          shares: 40,
          price: 22.2,
          amount: 888,
          fee: 8.68,
          tax: 14.3,
        });
      });

      test('Can the sell order be parsed with USD', () => {
        const activities = dadat.parsePages(
          servicePortfolioTransactions[5]
        ).activities;
        expect(activities.length).toEqual(1);
        expect(activities[0]).toEqual({
          broker: 'dadat',
          type: 'Sell',
          date: '2021-12-06',
          datetime: '2021-12-06T' + activities[0].datetime.substring(11),
          isin: 'US0567521085',
          company: 'BAIDU INC.A ADR DL-,00005',
          shares: 5,
          price: 120.434,
          amount: 602.17,
          fee: 11.26,
          tax: 0,
          fxRate: 1.1314,
          foreignCurrency: 'USD',
        });
      });
    });

    describe('Validate dividends', () => {
      test('Can the dividend be parsed in USD', () => {
        const activities = dadat.parsePages(
          servicePortfolioTransactions[2]
        ).activities;
        expect(activities.length).toEqual(1);
        expect(activities[0]).toEqual({
          broker: 'dadat',
          type: 'Dividend',
          date: '2021-05-06',
          datetime: '2021-05-06T' + activities[0].datetime.substring(11),
          isin: 'US4581401001',
          company: 'INTEL CORP.       DL-,001',
          shares: 25,
          price: 0.284,
          amount: 7.1,
          fee: 0,
          tax: 1.95,
          fxRate: 1.2232,
          foreignCurrency: 'USD',
        });
      });

      test('Can the dividend be parsed in HKD', () => {
        const activities = dadat.parsePages(
          servicePortfolioTransactions[3]
        ).activities;
        expect(activities.length).toEqual(1);
        expect(activities[0]).toEqual({
          broker: 'dadat',
          type: 'Dividend',
          date: '2021-05-24',
          datetime: '2021-05-24T' + activities[0].datetime.substring(11),
          isin: 'KYG875721634',
          company: 'TENCENT HLDGS   HD-,00002',
          shares: 11,
          price: 0.1690909090909091,
          amount: 1.86,
          fee: 0,
          tax: 0.51,
          fxRate: 9.46486,
          foreignCurrency: 'HKD',
        });
      });
    });
  });

  describe('Account-Depot: Portfolio Transactions', () => {
    test('parse sample 3776', () => {
      const activities = dadat.parsePages(
        accountDepotPortfolioTransactions[0]
      ).activities;
      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'dadat',
        type: 'Buy',
        date: '2021-08-20',
        datetime: '2021-08-20T' + activities[0].datetime.substring(11),
        isin: 'AT0000A06VC4',
        company: 'Managed Profit Plus T',
        shares: 117,
        price: 16.2,
        amount: 1895.4,
        fee: 39.86,
        tax: 0,
      });
    });
    test('parse sample 3891', () => {
      const activities = dadat.parsePages(
        accountDepotPortfolioTransactions[1]
      ).activities;
      expect(activities.length).toEqual(3);
    });
    test('parse sample 4446', () => {
      const activities = dadat.parsePages(
        accountDepotPortfolioTransactions[2]
      ).activities;
      expect(activities.length).toEqual(3);
    });

    test('parse sample 0', () => {
      const activities = dadat.parsePages(
        accountDepotPortfolioTransactions[3]
      ).activities;
      expect(activities.length).toEqual(6);
      expect(activities[0]).toEqual({
        broker: 'dadat',
        type: 'Sell',
        date: '2021-12-06',
        datetime: '2021-12-06T' + activities[0].datetime.substring(11),
        isin: 'US0567521085',
        company: 'BAIDU INC.A ADR DL-,00005',
        shares: 5,
        price: 120.434,
        amount: 602.17,
        fee: 11.26,
        tax: 0,
        fxRate: 1.1314080741318897,
        foreignCurrency: 'USD',
      });
      expect(activities[4]).toEqual({
        broker: 'dadat',
        type: 'Buy',
        date: '2021-06-01',
        datetime: '2021-06-01T' + activities[4].datetime.substring(11),
        isin: 'US0567521085',
        company: 'BAIDU INC.A ADR DL-,00005',
        shares: 5,
        price: 165.452,
        amount: 827.26,
        fee: 11.42,
        tax: 0,
        fxRate: 1.2131010806759663,
        foreignCurrency: 'USD',
      });
      expect(activities[5]).toEqual({
        broker: 'dadat',
        type: 'Dividend',
        date: '2021-05-24',
        datetime: '2021-05-24T' + activities[5].datetime.substring(11),
        isin: 'KYG875721634',
        company: 'TENCENT HLDGS   HD-,00002',
        shares: 11,
        price: 0.1690909090909091,
        amount: 1.86,
        fee: 0,
        tax: 0.51,
        fxRate: 9.46236559139785,
        foreignCurrency: 'HKD',
      });
    });
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
});
