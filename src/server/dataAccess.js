// Deterministic data access helpers for risk agent APIs
// Only access JSON via these exported functions; no direct disk I/O.

const path = require('path');
const indicatorData = require('../db/indicatorData.json');
const marketIndicators = require('../db/marketIndicators.json');
const correlationCoefficient = require('../db/correlationCoefficient.json');
const riskSpillover = require('../db/riskSpillover.json');

const TZ = 'Asia/Singapore';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const INDICATOR_KEYS = ['综合指数', '中低风险', '高风险'];
const MARKET_KEYS = ['股票市场', '债券市场', '外汇市场', '货币市场', '衍生品市场', '综合指数'];

function toISODateInTZ(date = new Date()) {
  // en-CA locale outputs YYYY-MM-DD
  return new Date(date).toLocaleDateString('en-CA', { timeZone: TZ });
}

function isValidDateStr(s) {
  return typeof s === 'string' && DATE_PATTERN.test(s);
}

function compareDateStr(a, b) {
  // YYYY-MM-DD lexicographical compare works
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function normalizeRange({ start, end, date }) {
  if (date) {
    if (!isValidDateStr(date)) {
      return { ok: false, error: { code: 'INVALID_DATE', message: '日期格式必须为 YYYY-MM-DD', details: { date } } };
    }
    return { ok: true, start: date, end: date };
  }
  if (!start || !end) {
    return { ok: false, error: { code: 'MISSING_RANGE', message: '必须提供 start 与 end 或提供 date', details: { start, end } } };
  }
  if (!isValidDateStr(start) || !isValidDateStr(end)) {
    return { ok: false, error: { code: 'INVALID_DATE', message: '日期格式必须为 YYYY-MM-DD', details: { start, end } } };
  }
  if (compareDateStr(start, end) > 0) {
    return { ok: false, error: { code: 'INVALID_DATE_RANGE', message: 'start 必须不晚于 end', details: { start, end } } };
  }
  return { ok: true, start, end };
}

function listIndicatorDates() {
  const daysObj = indicatorData['日期'] || {};
  // Keys are numeric strings; Object.values returns in key insertion order which is numeric ascending here
  return Object.values(daysObj);
}

function getIndicatorSeries(keys = INDICATOR_KEYS) {
  const dates = listIndicatorDates();
  return keys.map((k) => ({
    name: k,
    data: dates.map((d, i) => [d, indicatorData[k][String(i)]]).filter(([d, v]) => typeof v === 'number')
  }));
}

function filterSeriesByRange(series, start, end) {
  const filtered = series.map((s) => ({
    name: s.name,
    data: s.data.filter(([d]) => compareDateStr(d, start) >= 0 && compareDateStr(d, end) <= 0)
  }));
  const allDates = filtered.flatMap((s) => s.data.map(([d]) => d));
  const coverageStart = allDates.length ? allDates.reduce((min, d) => (compareDateStr(d, min) < 0 ? d : min), allDates[0]) : null;
  const coverageEnd = allDates.length ? allDates.reduce((max, d) => (compareDateStr(d, max) > 0 ? d : max), allDates[0]) : null;
  return { filtered, coverageStart, coverageEnd };
}

function getIndicatorSeriesInRange({ start, end, date, keys = INDICATOR_KEYS }) {
  const range = normalizeRange({ start, end, date });
  if (!range.ok) return range;
  const series = getIndicatorSeries(keys);
  const { filtered, coverageStart, coverageEnd } = filterSeriesByRange(series, range.start, range.end);
  if (!coverageStart || !coverageEnd) {
    return { ok: false, error: { code: 'EMPTY_RANGE', message: '数据在所请求区间无覆盖', details: { requested: { start: range.start, end: range.end } } } };
  }
  return {
    ok: true,
    series: filtered,
    requested: { start: range.start, end: range.end },
    coverage: { start: coverageStart, end: coverageEnd }
  };
}

function getMarketIndicatorSeriesInRange({ start, end, date, indicators = MARKET_KEYS }) {
  const range = normalizeRange({ start, end, date });
  if (!range.ok) return range;
  // Validate indicators
  const invalid = indicators.filter((m) => !MARKET_KEYS.includes(m));
  if (invalid.length) {
    return { ok: false, error: { code: 'INVALID_INDICATOR', message: '存在非法指标', details: { invalid, allowed: MARKET_KEYS } } };
  }
  const rows = Array.isArray(marketIndicators) ? marketIndicators : [];
  const inRangeRows = rows.filter((row) => compareDateStr(row['时间'], range.start) >= 0 && compareDateStr(row['时间'], range.end) <= 0);
  if (!inRangeRows.length) {
    return { ok: false, error: { code: 'EMPTY_RANGE', message: '数据在所请求区间无覆盖', details: { requested: { start: range.start, end: range.end } } } };
  }
  const series = indicators.map((k) => ({
    name: k,
    data: inRangeRows.map((row) => [row['时间'], row[k]]).filter(([, v]) => typeof v === 'number')
  }));
  const coverageStart = inRangeRows[0]['时间'];
  const coverageEnd = inRangeRows[inRangeRows.length - 1]['时间'];
  return {
    ok: true,
    series,
    requested: { start: range.start, end: range.end },
    coverage: { start: coverageStart, end: coverageEnd }
  };
}

function getTodayMatrices({ date } = {}) {
  const today = date && isValidDateStr(date) ? date : toISODateInTZ();
  return {
    ok: true,
    correlationCoefficient,
    riskSpillover,
    coverage: { start: today, end: today },
    requested: { start: today, end: today }
  };
}


module.exports = {
  TZ,
  INDICATOR_KEYS,
  MARKET_KEYS,
  normalizeRange,
  getIndicatorSeriesInRange,
  getMarketIndicatorSeriesInRange,
  getTodayMatrices,
};