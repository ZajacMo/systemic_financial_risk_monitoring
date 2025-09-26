<template>
    <div id="spillover" style="width: 1000px;height:1000px;"></div>
</template>


<script type="text/javascript">
import * as echarts from "echarts";
export default {
	name: "riskSpillover",
	data(){
		return{
			chartOption:{
				title: {left: "25%" },
				toolbox: {
					show: true,
					feature: {
						saveAsImage: {
							pixelRatio: 3  // 数值越高下载图片内存越大越清晰，建议范围（3-10）
						}
					}
				},
				series: [{
					type: "graph",
					layout: "circular",
					roam: true,
					focusNodeAdjacency: true,
					circular: {
						rotateLabel: true
					},
					label: {
						normal: {
							position: "inside",
							fontWeight: "bold",
							formatter: "{b}",
							fontSize: 13,
							normal: {textStyle: {fontFamily: "宋体"}}
						}
					},
					edgeSymbol: ["circle"],
					edgeSymbolSize: [4, 10],
					edgeLabel: {
						normal: {
							textStyle: {
								fontSize: 17,
								fontWeight: "bold",
								fontFamily: "宋体"
							}
						}
					},
					itemStyle: {
						normal: {
							label: {
								rotate: true,
								show: true,
								textStyle: {
									color: "#333",
									fontWeight: "400"
								}
							},
						},
						emphasis: {
							label: {
								show: true,
								textStyle: null
							}
						}
					},

					// 节点数据格式
					data: [
						{
							name: "节点1",
							symbolSize: 30, // 设置节点大小
							itemStyle: {
								normal: {
									color: "#F07C82"
								}
							}
						}, {
							name: "节点2",
							symbolSize: 34,
							itemStyle: {
								normal: {
									color: "#F07C82"
								}
							}
						},
						// ......
					],
                    
					// 线条数据格式
					links: [
						{
							source: "节点1",
							target: "节点2",
							name: "",
							tooltip: {
								trigger: "item",
								formatter: function (params) {
									return params.data.name;
								}
							},
							symbolSize: [5, 20],
							label: {
								normal: {
									formatter: function (params) {
										params.name = params.data.name;
										return params.name;
									},
									show: true
								}
							},
							lineStyle: {
								normal: {
									width: 0.6666666666666666,
									curveness: 0.2,
									color: "#F07C82"
								}
							}
						},
                        
						// ......
					]
				}]

			}

		};
	},
	mounted(){
		var myChart = echarts.init(document.getElementById("spillover"));
		myChart.setOption(this.chartOption);

	}

};
</script>
