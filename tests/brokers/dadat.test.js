import { findImplementation } from '@/index';
import * as dadat from '../../src/brokers/dadat';
import {
  buySamples,
  sellSamples,
  dividendSamples,
  allSamples,
  manualTest,
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

  describe('Validate buys', () => {
    test('Can the buy order be parsed', () => {
      const activities = dadat.parsePages(buySamples[0]).activities;
      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'dadat',
        type: 'Buy',
        date: '2021-07-28',
        datetime: '2021-07-28T10:00:00.000Z',
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
      const activities = dadat.parsePages(buySamples[1]).activities;
      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'dadat',
        type: 'Buy',
        date: '2021-05-18',
        datetime: '2021-05-18T10:00:00.000Z',
        isin: 'US69608A1088',
        company: 'PALANTIR TECHNOLOGIES INC',
        shares: 50,
        price: 16.876284422523636,
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
      const activities = dadat.parsePages(sellSamples[0]).activities;
      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'dadat',
        type: 'Sell',
        date: '2021-07-07',
        datetime: '2021-07-07T10:00:00.000Z',
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
      const activities = dadat.parsePages(sellSamples[1]).activities;
      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'dadat',
        type: 'Sell',
        date: '2021-12-06',
        datetime: '2021-12-06T11:00:00.000Z',
        isin: 'US0567521085',
        company: 'BAIDU INC.A ADR DL-,00005',
        shares: 5,
        price: 120.43485946614813,
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
      const activities = dadat.parsePages(dividendSamples[0]).activities;
      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'dadat',
        type: 'Dividend',
        date: '2021-05-06',
        datetime: '2021-05-06T10:00:00.000Z',
        isin: 'US4581401001',
        company: 'INTEL CORP.       DL-,001',
        shares: 25,
        price: 0.28409090909090906,
        amount: 7.1,
        fee: 0,
        tax: 1.95,
        fxRate: 1.2232,
        foreignCurrency: 'USD',
      });
    });

    test('Can the dividend be parsed in HKD', () => {
      const activities = dadat.parsePages(dividendSamples[1]).activities;
      expect(activities.length).toEqual(1);
      expect(activities[0]).toEqual({
        broker: 'dadat',
        type: 'Dividend',
        date: '2021-05-24',
        datetime: '2021-05-24T10:00:00.000Z',
        isin: 'KYG875721634',
        company: 'TENCENT HLDGS   HD-,00002',
        shares: 11,
        price: 0.16904634616888153,
        amount: 1.86,
        fee: 0,
        tax: 0.51,
        fxRate: 9.46486,
        foreignCurrency: 'HKD',
      });
    });
  });

  test('manualTest', () => {
    const activities = dadat.parsePages(manualTest[0]).activities;
    expect(activities.filter(activity => activity).length).toEqual(75);
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
});
