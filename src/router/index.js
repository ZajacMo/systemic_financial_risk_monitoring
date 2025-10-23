import Vue from "vue";
import VueRouter from "vue-router";
import dataPage from "@/views/DataPage";
import homePage from "@/views/HomePage.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", component: homePage },
    { path: "/data/:market", component: dataPage },
    // /agent 页面已移除
  ],
  mode: "history",
});

export default router;
