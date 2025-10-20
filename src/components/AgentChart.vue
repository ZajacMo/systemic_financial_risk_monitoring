<template>
	<div class="agent-chart">
		<div ref="chart" class="chart"></div>
	</div>
</template>

<script>
import * as echarts from "echarts";
export default {
	name: "AgentChart",
	props: {
		title: { type: String, default: "" },
		type: { type: String, default: "line" }, // 'line' | 'bar'
		series: { type: Array, required: true } // [{ name, data: [[date, value]] }]
	},
	data() {
		return { chart: null };
	},
	mounted() {
		this.initChart();
	},
	watch: {
		series: {
			deep: true,
			handler() { this.updateChart(); }
		},
		title() { this.updateChart(); },
		type() { this.updateChart(); }
	},
	methods: {
		initChart() {
			this.chart = echarts.init(this.$refs.chart);
			this.updateChart();
			window.addEventListener("resize", this.chart.resize);
		},
		allDates() {
			const set = new Set();
			(this.series || []).forEach((s) => (s.data || []).forEach(([d]) => set.add(d)));
			return Array.from(set).sort();
		},
		updateChart() {
			if (!this.chart) return;
			const dates = this.allDates();
			const option = {
				title: { text: this.title, left: "center" },
				tooltip: { trigger: "axis" },
				legend: { data: (this.series || []).map((s) => s.name), top: 10 },
				grid: { left: 40, right: 30, top: 60, bottom: 40 },
				xAxis: { type: "category", data: dates },
				yAxis: { type: "value" },
				series: (this.series || []).map((s) => ({
					name: s.name,
					type: this.type,
					smooth: this.type === "line",
					data: dates.map((d) => {
						const found = (s.data || []).find(([dd]) => dd === d);
						return found ? found[1] : null;
					})
				}))
			};
			this.chart.setOption(option, true);
		}
	},
	beforeDestroy() {
		if (this.chart) {
			window.removeEventListener("resize", this.chart.resize);
			this.chart.dispose();
		}
	}
};
</script>

<style>
.agent-chart { width: 100%; }
.chart { width: 100%; height: 360px; }
</style>