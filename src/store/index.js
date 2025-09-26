import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
const store = new Vuex.Store({
	state: {
		marketList: [
			{ id: 2, market: "货币市场", path: "/data/money" },
			{ id: 3, market: "债券市场", path: "/data/bond" },
			{ id: 4, market: "股票市场", path: "/data/stock" },
			{ id: 5, market: "外汇市场", path: "/data/foreignExchange" },
			{ id: 6, market: "衍生品市场", path: "/data/derivatives" }
		],

		// pressureCol: (() => {
		//     return [
		//         { prop: "日期", label: "日期", width: "auto" },
		//         { prop: "系统性金融风险", label: "金融系统", width: "auto" },
		//     ].concat(this.marketState)
		// })(),
		// corCol: (() => {
		//     return [
		//         { prop: "市场分类", label: "市场分类", width: "auto" },
		//     ].concat(this.marketState)
		// })(),
		tableData: [{
			date: "2016-05-02",
			name: "王小虎",
			address: "上海市普陀区金沙江路 1518 弄"
		}, {
			date: "2016-05-04",
			name: "王小虎",
			address: "上海市普陀区金沙江路 1517 弄"
		}, {
			date: "2016-05-01",
			name: "王小虎",
			address: "上海市普陀区金沙江路 1519 弄"
		}, {
			date: "2016-05-03",
			name: "王小虎",
			address: "上海市普陀区金沙江路 1516 弄"
		}],

	},
	getters:{

	}
});

export default store;