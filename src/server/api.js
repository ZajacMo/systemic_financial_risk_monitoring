// Express-style route registration for devServer
const {
  INDICATOR_KEYS,
  MARKET_KEYS,
  getIndicatorSeriesInRange,
  getMarketIndicatorSeriesInRange,
  getTodayMatrices,
} = require('./dataAccess');

function sendOk(res, payload) {
  res.json({ ok: true, ...payload });
}

function sendError(res, error, status = 400) {
  res.status(status).json({ ok: false, error });
}

function parseIndicatorsParam(q) {
  if (!q) return MARKET_KEYS;
  if (Array.isArray(q)) return q;
  if (typeof q === 'string') return q.split(',').map((s) => s.trim()).filter(Boolean);
  return MARKET_KEYS;
}

function registerAPIs(app) {
  // Enable JSON body parsing for POST requests
  const express = require('express');
  app.use(express.json());

  // Health
  app.get('/api/tools/health', (req, res) => {
    res.json({ ok: true, status: 'up' });
  });

  // 1) Systemic risk index range (indicatorData.json)
  app.get('/api/tools/risk-index', (req, res) => {
    const { start, end, date, keys } = req.query;
    const useKeys = keys ? parseIndicatorsParam(keys) : INDICATOR_KEYS;
    const result = getIndicatorSeriesInRange({ start, end, date, keys: useKeys });
    if (!result.ok) return sendError(res, result.error);
    return sendOk(res, {
      source: 'indicatorData.json',
      universe: '系统性金融风险压力指数',
      requested: result.requested,
      coverage: result.coverage,
      series: result.series,
    });
  });

  // 2) Market-specific indicators range (marketIndicators.json)
  app.get('/api/tools/market-indicators', (req, res) => {
    const { start, end, date, indicators } = req.query;
    const inds = parseIndicatorsParam(indicators);
    const result = getMarketIndicatorSeriesInRange({ start, end, date, indicators: inds });
    if (!result.ok) return sendError(res, result.error);
    return sendOk(res, {
      source: 'marketIndicators.json',
      universe: '分市场系统性风险压力指数',
      requested: result.requested,
      coverage: result.coverage,
      series: result.series,
    });
  });

  // 3) Today matrices: correlation and spillover
  app.get('/api/tools/matrices', (req, res) => {
    const { date } = req.query;
    const result = getTodayMatrices({ date });
    return sendOk(res, {
      source: ['correlationCoefficient.json', 'riskSpillover.json'],
      universe: '风险相关与溢出矩阵（当日）',
      requested: result.requested,
      coverage: result.coverage,
      correlationCoefficient: result.correlationCoefficient,
      riskSpillover: result.riskSpillover,
    });
  });


  // 4) LLM chat proxy to Ark
  const https = require('https');
  function arkChatCompletion({ messages, model = 'doubao-1-5-pro-32k-250115' }) {
    return new Promise((resolve, reject) => {
      const apiKey = process.env.ARK_API_KEY;
      if (!apiKey) {
        return reject({ message: '缺少 ARK_API_KEY 环境变量', details: { env: 'ARK_API_KEY' }, code: 'MISSING_API_KEY' });
      }
      const data = JSON.stringify({ messages, model });
      const req = https.request(
        {
          hostname: 'ark.cn-beijing.volces.com',
          path: '/api/v3/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(data),
          },
        },
        (r) => {
          let body = '';
          r.setEncoding('utf8');
          r.on('data', (chunk) => { body += chunk; });
          r.on('end', () => {
            try {
              const json = JSON.parse(body);
              if (r.statusCode >= 200 && r.statusCode < 300) {
                resolve(json);
              } else {
                const message = (json && json.error && (json.error.message || json.error.code)) || 'Ark API 错误';
                reject({ message, details: json, status: r.statusCode });
              }
            } catch (e) {
              reject({ message: 'Ark API 响应解析失败', details: { body }, cause: e });
            }
          });
        }
      );
      req.on('error', (err) => {
        reject({ message: 'Ark API 请求失败', details: err });
      });
      req.write(data);
      req.end();
    });
  }

  app.post('/api/llm/chat', async (req, res) => {
    const { messages, model } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return sendError(res, { message: '请求参数错误：messages 必须为非空数组' }, 400);
    }
    try {
      const ark = await arkChatCompletion({ messages, model });
      const content = ark && ark.choices && ark.choices[0] && ark.choices[0].message ? ark.choices[0].message.content : '';
      return sendOk(res, { text: content, raw: ark });
    } catch (err) {
      return sendError(res, { message: err.message || 'LLM 请求失败', details: err.details || err }, err.status || 502);
    }
  });
}

module.exports = { registerAPIs };