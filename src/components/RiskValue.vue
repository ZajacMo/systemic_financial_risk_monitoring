<template>
    <div id="value"></div>
</template>

<script>
import * as echarts from "echarts";
export default {
	name: "riskValue",
	props:{
		riskPossibility: {
			required: true,
			type: Number
		},
	},
	data(){
		return{
			option :{
				title:{
					text: this.riskPossibility,
					textStyle: {color: "#ffffff",fontSize: 30},
					left: "center",
					top: "center"
				},
				legend: {
					orient: "vertical",
					left: "left",
					data: ["中低风险概率", "高风险概率"],
                
				},
				series: {
					type: "pie",
					radius: ["50%", "60%"],
					avoidLabelOverlap: false,
					label: {show: false, position: "outside"},
					labelLine: {show: true},
					emphasis: {
						label: {show: true, fontSize: "10", fontWeight: "bold"},
						labelLine: {show: true}
					},data: [
						{ value: this.riskPossibility, name: "高风险区制概率密度" },
						{ value: 1-this.riskPossibility, name: "中低风险区制概率密度" }
					],
					color:["#59b881","#f5f5f5"] // 颜色 
				}
			}
		};
	},
	computed: {
		valueColor () {
			return this.riskPossibility < 0.4 ? "#59b881":(this.riskPossibility<0.6?"#e34d2c":"#e1642f");
		}
	},
	mounted () {
		this.option.series.color[0] = this.option.title.textStyle.color = this.valueColor;
		let mychart = echarts.init(document.getElementById("value"));
		mychart.setOption (this.option);
	}
};
</script>

<style>
#value{
    width: auto;
    min-height: 400px;
    max-height: 400px;
}
</style>