<template>
  <div id="app">
    <div id="header">
      <navMenu></navMenu>
    </div>
    <div id="body" :class="{ full: isAgentRoute }">
      <router-view :key="this.$route.path"></router-view>
    </div>
    <div id="footer" v-if="!isAgentRoute">
      <footerComponent></footerComponent>
    </div>
  </div>
</template>

<script>
/* eslint-disable indent */
import navMenu from "@/components/NavMenu.vue";
import footerComponent from "@/components/Footer.vue";

export default {
  name: "App",
  components: {
    navMenu,
    footerComponent,
  },
  computed: {
    isAgentRoute() {
      return this.$route && this.$route.path === "/agent";
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0 auto;
  padding: 0;
}

#header {
  position: sticky;
  z-index: 1000;
  top: 0;
  width: 100%;
  overflow: hidden;
  /* margin: 0 auto; */
  /* padding: auto; */
  background-color: #545c64;
  /* 新增：与菜单高度对齐，避免顶部右侧出现残影 */
  min-height: 56px;
  display: flex;
  align-items: center;
}
/* 移除 ElementUI 横向菜单的底边与伪元素，避免右上角突出 */
#header .el-menu.el-menu--horizontal {
  border-bottom: none !important;
  height: 56px;
  line-height: 56px;
}
#header .el-menu.el-menu--horizontal::before,
#header .el-menu.el-menu--horizontal::after {
  display: none !important;
}
#header .el-menu-item,
#header .el-submenu {
  border-bottom: none !important;
}

#body {
  background-color: #ebeff0;
  padding-bottom: 20px;
}
#body.full {
  min-height: calc(100vh - 56px);
  padding-bottom: 0;
}

#footer {
  bottom: 0;
  width: 100%;
  background-color: white;
}

.bodyContainer {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ebeff0;
}
.bg-white {
  background-color: white;
}
</style>
