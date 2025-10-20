import Vue from "vue";
import VueRouter from "vue-router";
import dataPage from "@/views/DataPage";
import homePage from "@/views/HomePage.vue";
import agentPage from "@/views/AgentPage.vue";

Vue.use(VueRouter);

const router = new VueRouter({
	routes: [
		{ path: "/", redirect: "/home" },
		{ path: "/home", component: homePage },
		{ path: "/data/:market", component: dataPage },
		{ path: "/agent", component: agentPage }
	],
	mode: "history"
});

export default router;