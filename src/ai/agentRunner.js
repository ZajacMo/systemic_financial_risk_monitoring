/* eslint-disable no-empty */
// Converted to JavaScript for runtime usage without TypeScript
// Do not expose internal reasoning; only return RiskAnswer-compatible object

const TZ = "Asia/Singapore";
const DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/g;
const ALLOWED_MARKET_INDICATORS = ["股票市场", "债券市场", "外汇市场", "货币市场", "衍生品市场", "综合指数"];

function parseDateRangeFromText(text) {
	const matches = Array.from(text.matchAll(DATE_RE)).map((m) => m[1]);
	if (matches.length === 1) return { date: matches[0] };
	if (matches.length >= 2) return { start: matches[0], end: matches[1] };
	if (/今日|今天|当日/.test(text)) {
		const today = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
		return { date: today };
	}
	return {};
}

function detectIntent(text) {
	if (/溢出|相关|矩阵|相关系数/.test(text)) return "matrices";
	if (/股票|债券|外汇|货币|衍生品/.test(text)) return "market";
	return "risk";
}

async function fetchJSON(url) {
	const res = await fetch(url);
	const data = await res.json();
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	if (data && data.ok === false) {
		const details = data.error && data.error.details ? `（详情：${JSON.stringify(data.error.details)}）` : "";
		throw new Error((data.error && data.error.message) ? `${data.error.message}${details}` : "工具错误");
	}
	return data;
}

function round2(n) {
	return Math.round(n * 100) / 100;
}

function buildSummaryForRisk(series, requested, coverage) {
	const idx = series.find((s) => s.name === "综合指数");
	const hi = series.find((s) => s.name === "高风险");
	if (!idx || !idx.data.length) return `该区间内无系统性风险数据覆盖。请求区间 ${requested.start} 至 ${requested.end}，实际覆盖 ${coverage.start} 至 ${coverage.end}。`;
	const first = idx.data[0][1];
	const last = idx.data[idx.data.length - 1][1];
	const change = round2(last - first);
	const hiChange = hi && hi.data.length ? round2(hi.data[hi.data.length - 1][1] - hi.data[0][1]) : undefined;
	const trend = change > 0 ? "上升" : (change < 0 ? "下降" : "持平");
	const seg = [`综合风险指数从 ${round2(first)} 至 ${round2(last)}，总体${trend}`];
	if (typeof hiChange === "number") seg.push(`高风险概率密度变化 ${hiChange >= 0 ? "增加" : "降低"} ${Math.abs(hiChange)}。`);
	return `时间 ${coverage.start} 至 ${coverage.end}。${seg.join(" ")}如需分市场或更长区间，可继续查询。`;
}

function buildSummaryForMarket(series, requested, coverage) {
	const lastVals = series
		.map((s) => ({ name: s.name, last: s.data.length ? s.data[s.data.length - 1][1] : NaN }))
		.filter((x) => !Number.isNaN(x.last))
		.sort((a, b) => b.last - a.last);
	if (!lastVals.length) return `该区间内无分市场数据覆盖。请求区间 ${requested.start} 至 ${requested.end}，实际覆盖 ${coverage.start} 至 ${coverage.end}。`;
	const top = lastVals.slice(0, 2).map((x) => `${x.name}≈${round2(x.last)}`).join("，");
	return `时间 ${coverage.start} 至 ${coverage.end}。分市场最新值以 ${top} 较高，建议关注高位与波动较大的市场。`;
}

function buildSummaryForMatrices(corr, spill, requested, coverage) {
	const cats = ["股票市场", "债券市场", "外汇市场", "货币市场", "衍生品市场"];
	let maxPair = { a: "", b: "", val: 0 };
	for (const row of corr) {
		const a = row["市场分类"];
		for (const b of cats) {
			if (b === a) continue;
			const v = Math.abs(row[b]);
			if (v > Math.abs(maxPair.val)) maxPair = { a, b, val: row[b] };
		}
	}
	let topSpill = { a: "", b: "", val: 0 };
	for (const row of spill) {
		const a = row["市场分类"];
		for (const b of cats) {
			if (b === a) continue;
			const v = row[b];
			if (v > topSpill.val) topSpill = { a, b, val: v };
		}
	}
	return `时间 ${coverage.start}。相关性最强为「${maxPair.a}↔${maxPair.b}」(${round2(maxPair.val)})，溢出最显著为「${topSpill.a}→${topSpill.b}」(${round2(topSpill.val)})。如需区间对比或细分，请继续查询。`;
}

export async function runAgent(query, userRange) {
	const range = userRange && (userRange.start || userRange.end || userRange.date) ? userRange : parseDateRangeFromText(query || "");
	const intent = detectIntent(query || "");

	if (intent === "matrices") {
		const dateParam = range.date ? `?date=${range.date}` : "";
		const r = await fetchJSON(`/api/tools/matrices${dateParam}`);
		const answer = buildSummaryForMatrices(r.correlationCoefficient, r.riskSpillover, r.requested, r.coverage);
		return {
			answer,
			evidence: [
				{ source: "correlationCoefficient.json", metric: "相关系数", universe: "当日矩阵", start: r.requested.start, end: r.requested.end, coverage: r.coverage },
				{ source: "riskSpillover.json", metric: "风险溢出", universe: "当日矩阵", start: r.requested.start, end: r.requested.end, coverage: r.coverage }
			],
			charts: [],
			follow_ups: ["查看近一周相关/溢出变化", "关注相关性最高的两市场的分市场指数", "扩展至更长区间进行稳定性评估"],
			disclaimer: "本回答不构成投资建议"
		};
	}

	if (intent === "market") {
		const indicatorsMentioned = ALLOWED_MARKET_INDICATORS.filter((k) => new RegExp(k).test(query || ""));
		const params = new URLSearchParams();
		if (range.date) params.set("date", range.date);
		if (range.start && range.end) {
			params.set("start", range.start);
			params.set("end", range.end);
		}
		if (indicatorsMentioned.length) params.set("indicators", indicatorsMentioned.join(","));
		const r = await fetchJSON(`/api/tools/market-indicators?${params.toString()}`);
		const answer = buildSummaryForMarket(r.series, r.requested, r.coverage);
		return {
			answer,
			evidence: r.series.map((s) => ({ source: "marketIndicators.json", metric: s.name, universe: "分市场系统性风险压力指数", start: r.requested.start, end: r.requested.end, coverage: r.coverage })),
			charts: [{ type: "line", title: "分市场系统性风险压力指数", x: "date", series: r.series }],
			follow_ups: ["仅查看指定市场", "延长时间区间进行趋势判断", "与综合指数进行对比"],
			disclaimer: "本回答不构成投资建议"
		};
	}

	const params = new URLSearchParams();
	if (range.date) params.set("date", range.date);
	if (range.start && range.end) {
		params.set("start", range.start);
		params.set("end", range.end);
	}
	const r = await fetchJSON(`/api/tools/risk-index?${params.toString()}`);
	const answer = buildSummaryForRisk(r.series, r.requested, r.coverage);
	return {
		answer,
		evidence: r.series.map((s) => ({ source: "indicatorData.json", metric: s.name, universe: "系统性金融风险压力指数", start: r.requested.start, end: r.requested.end, coverage: r.coverage })),
		charts: [{ type: "line", title: "系统性风险指数与概率密度", x: "date", series: r.series }],
		follow_ups: ["查看分市场差异", "扩大或缩小时间窗口", "进一步分析高风险概率的峰值与波动"],
		disclaimer: "本回答不构成投资建议"
	};
}

export async function askLLM(messages, model) {
	const res = await fetch("/api/llm/chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ messages, model })
	});
	const data = await res.json();
	if (!res.ok || data.ok === false) {
		const details = data && data.error && data.error.details ? `（详情：${JSON.stringify(data.error.details)}）` : "";
		throw new Error((data && data.error && data.error.message) ? `${data.error.message}${details}` : `LLM 错误 HTTP ${res.status}`);
	}
	return data;
}


function deriveProvidedFromAnswer(result) {
	// 支持 RiskAnswer 形状的容错提取
	if (!result) return { requested: {}, coverage: {}, series: [], correlationCoefficient: [], riskSpillover: [] };
	const hasRaw = result.requested && result.coverage;
	if (hasRaw) {
		const seriesFromCharts = Array.isArray(result.charts) && result.charts.length ? (result.charts[0].series || []) : [];
		return {
			requested: result.requested,
			coverage: result.coverage,
			series: (Array.isArray(result.series) && result.series.length) ? result.series : seriesFromCharts,
			correlationCoefficient: result.correlationCoefficient || [],
			riskSpillover: result.riskSpillover || []
		};
	}
	const ev = Array.isArray(result.evidence) ? result.evidence : [];
	const starts = ev.map((e) => e.start).filter(Boolean).sort();
	const ends = ev.map((e) => e.end).filter(Boolean).sort();
	const covStarts = ev.map((e) => e.coverage && e.coverage.start).filter(Boolean).sort();
	const covEnds = ev.map((e) => e.coverage && e.coverage.end).filter(Boolean).sort();
	const requested = (starts.length && ends.length) ? { start: starts[0], end: ends[ends.length - 1] } : {};
	const coverage = (covStarts.length && covEnds.length) ? { start: covStarts[0], end: covEnds[covEnds.length - 1] } : requested;
	const series = Array.isArray(result.charts) && result.charts.length ? (result.charts[0].series || []) : [];
	return { requested, coverage, series, correlationCoefficient: [], riskSpillover: [] };
}


export async function planToolCallsWithLLM({ query, intent, range }) {
	// 轻量函数调用规划：指示 LLM 仅返回 JSON（calls 数组）
	const system = [
		"你可以调用如下工具以获取事实数据：",
		"- get_risk_index({start,end}|{date})",
		"- get_market_indicators({start,end}|{date}, indicators?)",
		"- get_today_matrices({date})",
		"仅当需要外部数据时返回一个 JSON：{ calls: [{ name, arguments }] }，不输出其他文本。",
	].join("\n");
	const seedRange = range || parseDateRangeFromText(query || "");
	const messages = [
		{ role: "system", content: system },
		{ role: "user", content: `问题: ${query || ""}\n意图: ${intent}\n已知日期: ${JSON.stringify(seedRange)}` },
		{ role: "assistant", content: "{" }
	];
	try {
		const llm = await askLLM(messages);
		const plan = toJSONSafe(llm.text || "");
		if (plan && Array.isArray(plan.calls)) return plan;
	} catch (e) { void e; }
	// 兜底：不触发外部调用，交由前端解释模块处理
	return { calls: [] };
}

async function llmExplainCauses({ intent, provided, query }) {
	const sys = [
		"你需要在提供的区间与数值背景下，解释风险指标变化的可能原因。",
		"仅给出一般性可能原因（宏观环境、政策调整、市场流动性、行业动态、外部风险等），不要断言具体事件。",
		"输出为中文，2–3 个要点，尽量贴合数值变化的方向与强度。"
	].join("\n");
	const messages = [
		{ role: "system", content: sys },
		{ role: "system", content: `provided_data:\n${JSON.stringify({ intent, ...provided })}` },
		{ role: "user", content: query || "" },
		{ role: "assistant", content: "-" }
	];
	try {
		const llm = await askLLM(messages);
		return (llm && llm.text) ? llm.text : "";
	} catch (e) { return ""; }
}

export async function explainWithLLM({ query, intent, result }) {
	const provided = deriveProvidedFromAnswer(result);
	const system = [
		"角色：你是金融风险网站的分析 Agent。",
		"只能依据 provided_data 的数值进行分析，禁止臆测或补全。",
		"输出为简短中文解释（80–150 字），回答用户问题并解释为什么这样。",
		"需引用区间与关键结论（上升/下降/持平、顶部市场、最强相关/溢出等）。",
		"如 covered 与 requested 不一致，需提示覆盖范围。",
		"不得泄露内部推理。"
	].join("\n");
	const messages = [
		{ role: "system", content: system },
		{ role: "system", content: `provided_data:\n${JSON.stringify({ intent, ...provided })}` },
		{ role: "user", content: query || "" },
		{ role: "assistant", content: "=" }
	];
	let base = "";
	try {
		const llm = await askLLM(messages);
		base = (llm && llm.text) ? llm.text : "";
	} catch (_) { base = ""; }
	const causes = await llmExplainCauses({ intent, provided, query });
	const combined = [base, causes ? `可能原因：${causes}` : ""].filter(Boolean).join(" ");
	return combined || base || "";
}

function toJSONSafe(text) {
	if (!text) return null;
	let s = String(text).trim();
	// strip code fences
	s = s.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
	// drop leading non-json until first { or [
	const firstBrace = s.indexOf("{");
	const firstBracket = s.indexOf("[");
	let start = -1;
	if (firstBrace >= 0 && firstBracket >= 0) start = Math.min(firstBrace, firstBracket);
	else start = firstBrace >= 0 ? firstBrace : firstBracket;
	if (start > 0) s = s.slice(start);
	// attempt direct parse
	try { return JSON.parse(s); } catch (_) {}
	// try until last closing brace/bracket
	const endBrace = s.lastIndexOf("}");
	const endBracket = s.lastIndexOf("]");
	const end = Math.max(endBrace, endBracket);
	if (end > 0) {
		const sub = s.slice(0, end + 1);
		try { return JSON.parse(sub); } catch (_) {}
	}
	// remove trailing commas
	s = s.replace(/,\s*([}\]])/g, "$1");
	try { return JSON.parse(s); } catch (_) { return null; }
}

export async function analyzeWithFunctionCalling({ query, userRange }) {
	const intent = detectIntent(query || "");
	const ans = await runAgent(query || "", userRange);
	// 直接让解释函数从 ans 中提取区间与序列，并自行拉取事件
	const text = await explainWithLLM({ query, intent, result: ans });
	return { ans, text };
}