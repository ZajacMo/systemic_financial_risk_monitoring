<template>
    <div class="bodyContainer">
        <el-row></el-row>
        <el-row :gutter="20">
            <el-col :span="24" class="bg-white">
                <riskLine mode="market"></riskLine>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="8" class="bg-white">
                <div class="grid-content bg-purple"></div>
            </el-col>
            <el-col :span="8" class="bg-white">
                <div class="grid-content bg-purple"></div>
            </el-col>
            <el-col :span="4" class="bg-white">
                <div class="grid-content bg-purple"></div>
            </el-col>
            <el-col :span="4" class="bg-white">
                <div class="grid-content bg-purple"></div>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="4" class="bg-white">
                <div class="grid-content bg-purple"></div>
            </el-col>
            <el-col :span="16" class="bg-white">
                <div class="grid-content bg-purple"></div>
            </el-col>
            <el-col :span="4" class="bg-white">
                <div class="grid-content bg-purple"></div>
            </el-col>
        </el-row>


    </div>
</template>

<script>
import riskLine from "@/components/RiskLine.vue";
export default {
	name: "dataPage", 
	components: {
		riskLine
	},
	methods: {
		handleSelect(key, keyPath) {
			console.log(key, keyPath);
		},
	}
};
</script>

<style scoped>


/* .grid-content {
    border-radius: 4px;
    min-height: 36px;
}

.row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
} */



</style>
