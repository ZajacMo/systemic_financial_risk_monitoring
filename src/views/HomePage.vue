<template>
    <div class="body-container">
        <div class="display-row">
            <div class="display-col" style="width: 65%;">
                <i class="el-icon-data-line icon">&ensp;|&ensp;风险图像</i>
                <riskLine mode="system" class="card"></riskLine>
            </div>
            <div class="display-col" style="width: 32%;">
                <div style="position:absolute; top:15%; width: 95%; text-align: center; font-size: 15px;"><strong>今日</strong>高风险区制概率密度</div>
                <i class="el-icon-pie-chart icon">&ensp;|&ensp;风险区制</i>
                <riskValue :riskPossibility="0.3633" class="card"></riskValue>
            </div >
        </div>
        <div class="display-row">
            <div class="display-col" style="width: 32%;">
                <i class="el-icon-data-analysis icon">&ensp;|&ensp;风险溢出</i>
                <riskMap class="card" style="height: 400px;max-width: 100%;padding: 0px;"></riskMap>
                <!-- <el-table stripe style="width: 100%"
                    class="card"
                    fit
                    :data="riskSpillover"
                    :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column v-for='item in getCols([
                        { prop: "市场分类", label: "溢出源\\方向", width: "15%" },
                        ])'
                        :key="item.prop"
                        :prop="item.prop" 
                        :label="item.label"
                        :min-width="item.width">
                    </el-table-column>
                </el-table> -->
            </div>
            <div class="display-col" style="width: 65%;">
                <i class="el-icon-connection icon">&ensp;|&ensp;相关系数</i>
                <div class="card">
                    <el-table stripe style="width: 100%"
                    fit
                    height="360"
                    size="medium"
                    :data="correlationCoefficients"
                    :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column v-for='item in getCols([
                        { prop: "市场分类", label: "市场分类", width: "16%" },
                        ])'
                        :key="item.prop"
                        :prop="item.prop" 
                        :label="item.label"
                        :min-width="item.width">
                        </el-table-column>
                    </el-table>
                </div>
                
            </div>
        </div>
        <div class="display-row">
            <div class="display-col" style="width: 100%;">
                <i class="el-icon-date icon">&ensp;|&ensp;市场压力</i>
                <el-table stripe style="width: 100%" 
                    class="card"
                    :data="marketIndicators.slice(-6,-1).reverse()"
                    fit 
                    :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column v-for='item in getCols([
                            { prop: "时间", label: "日期", width: "15%" },
                            { prop: "综合指数", label: "金融系统", width: "15%" },
                        ])' 
                        :key="item.prop"
                        :prop="item.prop" 
                        :label="item.label"
                        :min-width="item.width" >
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <el-row :gutter="20">
            <el-col :span="12"><div class="grid-content bg-purple"></div></el-col>
            <el-col :span="12"></el-col>
        </el-row>
    </div>
</template>

<script>
import riskLine from "@/components/RiskLine.vue";
import riskValue from "@/components/RiskValue.vue";
import riskMap from "@/components/RiskMap.vue";
import marketIndicators from "@/db/marketIndicators.json";
import correlationCoefficients from "@/db/correlationCoefficient.json";
import riskSpillover from "@/db/riskSpillover.json";
import {mapState} from "vuex";
export default {
	name: "homePage",
	components: {
		riskLine,
		riskValue,
		riskMap,
	},props:{


	},
	data(){
		return{
			displayState:[
				{prop: "date", label: "日期", width: "15%"},
				{prop: "name", label: "姓名", width: "180"},
				{prop: "address", label: "地址", width: "auto"},
			],

			marketIndicators,
			correlationCoefficients,
			riskSpillover,
		};
	},computed:{
		...mapState(["tableData"]),
	},methods:{
		getCols(col){
			return   col.concat([
				{ prop: "股票市场", label: "股票市场", width: "15%" },
				{ prop: "债券市场", label: "债券市场", width: "15%" },
				{ prop: "外汇市场", label: "外汇市场", width: "15%" },
				{ prop: "货币市场", label: "货币市场", width: "15%" },
				{ prop: "衍生品市场", label: "衍生品市场", width: "15%" }
			]);
		}
	}
};
</script>

<style scoped>
div.body-container{
    padding-top: 20px;
    max-width: 90%;
    margin: 0 auto;
    div.display-row{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 20px;
        div.display-col{
            width: 48%;
            position: relative;
        }
        i.icon{
            padding-bottom: 15px;
            text-align: left;
            font-family: "PingFang SC","Hiragino Sans GB";
            font-weight: 700 !important;
            line-height: 2;
        }
    }
    div.card{
        border-radius: 16px;
        background-color: #f9fafc;
        padding: 20px;
    }
}

</style>