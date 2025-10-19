<template>
    <div id="nav">
        <div class="line"></div>
        <el-menu :default-active="activeIndex" class="el-menu-demo w1200" mode="horizontal" @select="handleSelect">
            <el-menu-item index="1">主页</el-menu-item>
            <el-submenu index="2">
                <template slot="title">数据中心</template>
                <el-menu-item v-for="item in list" :key="item.id" :index="`2-${item.id}`">
                    {{ item.market }}
                </el-menu-item>
            </el-submenu>
            <el-menu-item index="3" disabled>消息中心</el-menu-item>
            <el-menu-item index="4">接口管理</el-menu-item>
        </el-menu>
    </div>
</template>

<script>
export default {
    name: 'navMenu',
    data() {
        return {
            activeIndex: '1',
            list: [
                { id: 1, market: '金融系统', path: 'img/系统性金融风险压力指数.svg' },
                { id: 2, market: '货币市场', path: 'img/货币市场压力指数.svg' },
                { id: 3, market: '债券市场', path: 'img/债券市场压力指数.svg' },
                { id: 4, market: '股票市场', path: 'img/股票市场压力指数.svg' },
                { id: 5, market: '外汇市场', path: 'img/外汇市场压力指数.svg' },
                { id: 6, market: '衍生品市场', path: 'img/衍生品市场压力指数.svg' }
            ]
        };
    },
    methods: {
        handleSelect(key, keyPath) {
            console.log(key, keyPath);
        },
    }
}
</script>

<style>
#nav {
    position: fixed;
    width: 100%;
    z-index: 1000;
}
</style>