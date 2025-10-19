<template>
    <div id="menu">
        <el-menu :default-active="this.$route.path" class="el-menu-demo" 
                mode="horizontal" menu-trigger="click" router
                background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
            <el-menu-item index="/home">最新信息</el-menu-item>
            <el-submenu index="/data">
                <template slot="title">市场数据</template>
                <el-menu-item 
                    v-for="item in marketList" 
                    :key="item.id" 
                    :index="`${item.path}`" disabled>
                    {{ item.market }}
                </el-menu-item>
            </el-submenu>
            <!-- <el-menu-item index="3" disabled>消息中心</el-menu-item> -->
            <el-menu-item index="/about" disabled>关于我们</el-menu-item>
            <el-menu-item index="/outter" disabled>接口管理</el-menu-item>
        </el-menu>
    </div>
</template>

<script>
import {mapState} from "vuex";
export default {
	name: "navMenu",
	computed: {
		...mapState(["marketList"])
	}
};
</script>

<style>
#menu{
    margin: 0 auto;
    max-width: 90%;
}</style>