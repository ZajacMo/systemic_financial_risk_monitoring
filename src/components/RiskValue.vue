<template>
  <div id="value"></div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "riskValue",
  props: {
    riskPossibility: {
      required: true,
      type: Number,
    },
  },
  data() {
    return {
      option: {
        title: {
          text: this.riskPossibility,
          textStyle: { color: "#ffffff", fontSize: 22 },
          left: "center",
          top: "center",
        },
        legend: {
          orient: "vertical",
          left: "left",
          data: ["中低风险概率", "高风险概率"],
        },
        tooltip: {
          trigger: "item",
          confine: true,
          formatter: function (p) {
            var val = typeof p.value === "number" ? p.value : Number(p.value);
            var pct = Math.round(val * 10000) / 100;
            return p.name + ": " + pct + "%";
          },
          extraCssText:
            "pointer-events:none; font-size: 12px; padding: 6px 8px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,.12);",
          position: function (point, params, dom, rect, size) {
            try {
              var el = document.getElementById("value");
              var r = el
                ? el.getBoundingClientRect()
                : { width: 300, height: 300 };
              var cx = r.width / 2;
              var cy = r.height / 2;
              var dx = point[0] - cx;
              var dy = point[1] - cy;
              var len = Math.sqrt(dx * dx + dy * dy) || 1;
              var ux = dx / len;
              var uy = dy / len;
              var offset = 18;
              var x = point[0] + ux * offset - size.contentSize[0] / 2;
              var y = point[1] + uy * offset - size.contentSize[1] / 2;
              var pad = 8;
              x = Math.max(
                pad,
                Math.min(x, r.width - size.contentSize[0] - pad)
              );
              y = Math.max(
                pad,
                Math.min(y, r.height - size.contentSize[1] - pad)
              );
              return [x, y];
            } catch (e) {
              return point;
            }
          },
        },
        series: {
          type: "pie",
          radius: ["50%", "60%"],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            label: { show: false },
            labelLine: { show: false },
          },
          data: [
            { value: this.riskPossibility, name: "高风险区制概率密度" },
            { value: 1 - this.riskPossibility, name: "中低风险区制概率密度" },
          ],
          color: ["#59b881", "#f5f5f5"], // 颜色
        },
      },
    };
  },
  computed: {
    valueColor() {
      return this.riskPossibility < 0.4
        ? "#59b881"
        : this.riskPossibility < 0.6
        ? "#e34d2c"
        : "#e1642f";
    },
  },
  methods: {
    computeFontSize() {
      try {
        const el = document.getElementById("value");
        const width = el ? el.offsetWidth : 400;
        // 依据容器宽度的响应式字体，限制在 16–26 像素
        return Math.max(16, Math.min(26, Math.round(width * 0.05)));
      } catch (e) {
        return 22;
      }
    },
    applyResponsiveTitle() {
      const size = this.computeFontSize();
      this.option.title.textStyle.fontSize = size;
      if (this._chart) {
        this._chart.setOption({ title: { textStyle: { fontSize: size } } });
      }
    },
  },
  mounted() {
    this.option.series.color[0] = this.option.title.textStyle.color =
      this.valueColor;
    this.option.title.textStyle.fontSize = this.computeFontSize();
    this._chart = echarts.init(document.getElementById("value"));
    this._chart.setOption(this.option);
    // 监听窗口变化，保持数字尺寸合适
    this._onResize = () => this.applyResponsiveTitle();
    window.addEventListener("resize", this._onResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this._onResize);
  },
};
</script>

<style>
#value {
  width: auto;
  min-height: 400px;
  max-height: 400px;
  overflow: visible;
}
</style>
