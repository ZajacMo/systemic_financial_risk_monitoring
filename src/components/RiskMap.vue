<template>
    <div id="chart"></div>
</template>

<script>
import * as d3 from "d3";

export default {
	name: "riskMap",
	data() {
		return {
			matrix: [
				[0.942086, 0.366686, 0.051861, 0.039676, 0.073857],
				[0.046843, 0.541732, 0.074208, 0.043369, 0.013779],
				[0.003473, 0.038901, 0.722477, 0.049730, 0.118889],
				[0.005860, 0.050144, 0.109683, 0.824255, 0.269742],
				[0.001738, 0.002538, 0.041771, 0.042970, 0.523734]
			],
			labels: ["股票市场", "债券市场", "外汇市场", "货币市场", "衍生品市场"],
			
			colors: d3.scaleOrdinal()
				.domain(d3.range(5))
				.range(["#314E89", "#A2D4AB", "#606c76", "#73A5C6", "#F2D779"])
		};
	},
	mounted() {
		this.drawChart();
		window.addEventListener("resize", this.drawChart);
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.drawChart);
	},
	methods: {
		drawChart() {
			d3.select("#chart").selectAll("*").remove();

			const container = d3.select("#chart").node();
			const width = container.offsetWidth;
			const height = container.offsetHeight;
			const innerRadius = Math.min(width, height) * 0.35;
			const outerRadius = innerRadius * 1.1;

			let svg = d3.select("#chart").append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
			
			// 3. 创建弦图布局  
			const chord = d3.chord()
				.padAngle(0.05)
				.sortSubgroups(d3.descending)(this.matrix);
            
			// 4. 创建弧形生成器  
			const arc = d3.arc()
				.innerRadius(innerRadius)
				.outerRadius(outerRadius);

			// 5. 创建 ribbon 生成器 
			const ribbon = d3.ribbon()
				.radius(innerRadius);

			// 6. 添加弧形 (Groups) 
			const groups = svg.append("g")
				.attr("class", "groups")
				.selectAll("g")
				.data(chord.groups)
				.enter().append("g");

			groups.append("path")
				.style("fill", d => this.colors(d.index))
				.style("stroke", d => d3.rgb(this.colors(d.index)).darker())
				.attr("d", arc)
				.on("mouseover", (event, d) => this.fade(svg, 0.1, d.index))
				.on("mouseout", (event, d) => this.fade(svg, 1, d.index));
                
			// 添加标签 
			groups.append("text")
				.each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
				.attr("dy", ".35em")
				.attr("class", "titles")
				.attr("transform", d => {
					return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                        + "translate(" + (outerRadius + 10) + ")"
                        + (d.angle < 0.5*Math.PI || d.angle >= 1.4 * Math.PI ? "rotate(90)" : "rotate(-90)");
				})
				.style("text-anchor", "middle")
				.text((_, i) => this.labels[i]);
			
			// 7. 添加弦 (Chords) 
			svg.append("g")
				.attr("class", "chord")
				.selectAll("path")
				.data(chord)
				.enter().append("path")
				.attr("d", ribbon)
				.style("fill", d => this.colors(d.target.index))
				.style("opacity", 0.7)
				.style("margin", "10px")
				.on("mouseover", (event,d) => {
					this.tooltip.transition()
						.duration(200)
						.style("opacity", .9);
					const [x, y] = d3.pointer(event);
					this.tooltip.html(d.source.value)
						.style("position", "absolute")
						.style("background", "lightsteelblue")
						.style("border", "0px")
						.style("border-radius", "4px")
						.style("padding", "2px")
						.style("font", "12px sans-serif")
						.style("left", x + width/2 - 20 + "px")
						.style("top", y+height/2+ "px");
				})
				.on("mouseout", () => {
					this.tooltip.transition()
						.duration(500)
						.style("opacity", 0);
				});

			// 8. 添加 Tooltip  
			this.tooltip = d3.select("#chart").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);
		},
		fade(svg, opacity, index) {
			svg.selectAll(".chord path")
				.filter(d => d.source.index !== index && d.target.index !== index)
				.transition()
				.style("opacity", opacity);
		}
	}
};
</script>

<style scoped>
#chart {
    width: 100%;
    height: 100%;
}

.chord path {
    fill-opacity: 0.67;
    stroke: none;
    stroke-width: 0.5px;
}
</style>