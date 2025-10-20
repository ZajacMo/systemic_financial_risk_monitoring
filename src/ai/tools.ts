// LLM tool declarations (function calling schemas) equivalent to backend APIs
// Parameters must include start/end or date; enforce order and enums; recoverable errors.

export const ALLOWED_MARKET_INDICATORS = [
  '股票市场',
  '债券市场',
  '外汇市场',
  '货币市场',
  '衍生品市场',
  '综合指数',
];

const dateStringSchema = {
  type: 'string',
  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  description: '日期，格式 YYYY-MM-DD（Asia/Singapore）',
};

export const tools = [
  {
    name: 'get_risk_index',
    description:
      '获取系统性金融风险压力指数与概率密度（综合指数/中低风险/高风险）在指定日期或区间的时间序列。',
    endpoint: '/api/tools/risk-index',
    parameters: {
      type: 'object',
      properties: {
        start: { ...dateStringSchema },
        end: { ...dateStringSchema },
        date: { ...dateStringSchema },
        keys: {
          type: 'array',
          items: { enum: ['综合指数', '中低风险', '高风险'] },
          description: '可选，默认返回全部三项',
        },
      },
      anyOf: [
        { required: ['date'] },
        { required: ['start', 'end'] },
      ],
      additionalProperties: false,
    },
    errors: {
      INVALID_DATE: '日期格式必须为 YYYY-MM-DD',
      INVALID_DATE_RANGE: 'start 必须不晚于 end',
      MISSING_RANGE: '必须提供 start 与 end 或提供 date',
      EMPTY_RANGE: '数据在所请求区间无覆盖',
    },
  },
  {
    name: 'get_market_indicators',
    description:
      '获取各市场系统性金融风险压力指数在指定日期或区间的时间序列（可选市场）。',
    endpoint: '/api/tools/market-indicators',
    parameters: {
      type: 'object',
      properties: {
        start: { ...dateStringSchema },
        end: { ...dateStringSchema },
        date: { ...dateStringSchema },
        indicators: {
          type: 'array',
          items: { enum: ALLOWED_MARKET_INDICATORS },
          minItems: 1,
          description: '要检索的市场指标，不传则为全部',
        },
      },
      anyOf: [
        { required: ['date'] },
        { required: ['start', 'end'] },
      ],
      additionalProperties: false,
    },
    errors: {
      INVALID_DATE: '日期格式必须为 YYYY-MM-DD',
      INVALID_DATE_RANGE: 'start 必须不晚于 end',
      MISSING_RANGE: '必须提供 start 与 end 或提供 date',
      INVALID_INDICATOR: '存在非法指标',
      EMPTY_RANGE: '数据在所请求区间无覆盖',
    },
  },
  {
    name: 'get_today_matrices',
    description:
      '获取今日的相关系数矩阵与风险溢出矩阵；可指定 date，但若与覆盖不一致需在答案提示缺口。',
    endpoint: '/api/tools/matrices',
    parameters: {
      type: 'object',
      properties: {
        date: { ...dateStringSchema },
      },
      required: ['date'],
      additionalProperties: false,
    },
    errors: {},
  },
] as const;

export type ToolDeclaration = typeof tools[number];