<template>
  <div id="line"></div>
</template>

<script>
import * as echarts from "echarts";
import { mapState } from "vuex";
import indicatorData from "@/db/indicatorData.json";
export default {
  name: "riskLine",
  props: {
    riskData: {
      type: Array,
      dafault: () => [],
    },
    mode: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      indicatorData,
      chartOption: {
        title: {
          text: "",
          left: "center",
        },
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: "none" },
            restore: {},
            saveAsImage: {},
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            animation: false,
          },
          formatter: function (params) {
            return params
              .map(function (param) {
                return param.marker + param.seriesName + ": " + param.value;
              })
              .join("<br>");
          },
        },
        legend: {
          data: ["系统性金融风险压力指数", "高风险区制概率密度"],
          left: 10,
          textStyle: { fontSize: 12 },
          itemWidth: 10,
          itemHeight: 6,
        },
        axisPointer: {
          link: { xAxisIndex: "all" },
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            end: 10,
            xAxisIndex: [0, 1],
          },
          {
            type: "inside",
            realtime: true,
            end: 10,
            xAxisIndex: [0, 1],
          },
        ],
        grid: [
          {
            left: 40,
            right: 50,
            height: "50%",
          },
          {
            left: 40,
            right: 50,
            top: "72%",
            height: "16%",
          },
        ],
        xAxis: [
          {
            gridIndex: 0,
            type: "category",
            boundaryGap: false,
            axisLine: {
              onZero: false,
            },
            inverse: false,
            data: Object.values(indicatorData.日期),
          },
          {
            gridIndex: 1,
            type: "category",
            boundaryGap: false,
            axisLine: {
              onZero: true,
            },
            axisLabel: {
              show: false,
            },
            inverse: false,
            data: Object.values(indicatorData.日期),
            position: "top",
          },
        ],
        yAxis: [
          {
            name: "系统性金融风险\n压力指数",
            nameTextStyle: {
              color: "#999",
              fontSize: 10,
            },
            type: "value",
            max: 1,
          },
          {
            name: "高风险区制\n概率密度",
            nameTextStyle: {
              color: "#999",
              fontSize: 10,
            },
            type: "value",
            inverse: true,
            gridIndex: 1,
            max: 0.5,
          },
        ],
        series: [
          {
            name: "系统性金融风险压力指数",
            type: "line",
            smooth: true,
            xAxisIndex: 0,
            yAxisIndex: 0,
            lineStyle: { width: 1 },
            emphasis: { focus: "series" },
            data: Object.values(indicatorData.综合指数),
            //    markArea: {
            //         itemStyle: {
            //             color: 'rgba(255, 173, 177, 0.4)'
            //         },
            //         data: [
            //             [
            //                 {xAxis: '2024-04-01'},
            //                 {xAxis: '2024-09-30'}
            //             ],
            //         ]
            //     },
          },
          {
            name: "高风险区制概率密度",
            type: "line",
            smooth: true,
            yAxisIndex: 1,
            xAxisIndex: 1,
            areaStyle: {},
            lineStyle: {
              width: 1,
            },
            emphasis: {
              focus: "series",
            },
            data: Object.values(indicatorData.高风险),
          },
        ],
      },
    };
  },
  computed: {
    ...mapState(["marketList"]),
    titleText() {
      if (this.mode === "market") {
        const market = this.marketList.find(
          (el) => el.path === this.$route.path
        ).market;
        return market ? `${market}风险指数` : "";
      } else {
        return "";
      }
    },
  },
  watch: {
    titleText(newTitle) {
      this.chartOption.title.text = newTitle;
    },
  },
  mounted() {
    this.chartOption.title.text = this.titleText;
    let mychart = echarts.init(document.getElementById("line"));
    mychart.setOption(this.chartOption);
  },
};
</script>

<style>
#line {
  float: center;
  margin: 0;
  height: 400px;
  width: auto;
}
</style>
