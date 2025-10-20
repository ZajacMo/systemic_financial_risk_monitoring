export interface RiskAnswer {
  answer: string; // 摘要/结论（中文）
  evidence: Array<{
    source: string;
    metric: string;
    universe: string;
    start: string;
    end: string;
    coverage: { start: string; end: string };
  }>;
  charts: Array<{
    type: 'line' | 'bar';
    title: string;
    x: 'date';
    series: Array<{ name: string; data: Array<[string, number]> }>;
  }>;
  follow_ups: string[];
  disclaimer: string; // 不构成投资建议
}