import Vue from "vue";
import App from "@/App.vue";
import store from "@/store/index";
import router from "@/router/index";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.config.productionTip = false;
Vue.use(ElementUI, { size: "small", zIndex: 3000 });

new Vue({
	render: h => h(App),
	store,
	router
}).$mount("#app");
