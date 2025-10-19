<template>
  <div id="app">
    <div id="header">
      <navMenu></navMenu>
    </div>
    <div id="body">
      <router-view :key="this.$route.path"></router-view>
    </div>
    <div id="footer">
      <footerComponent></footerComponent>
    </div>
  </div>
</template>

<script>
import navMenu from "@/components/NavMenu.vue";
import footerComponent from "@/components/Footer.vue";

export default {
	name: "App",
	components: {
		navMenu,
		footerComponent
	},
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

#header{
  position: sticky;
  z-index: 1000;
  top: 0;
  width:  100%;
  overflow: hidden;
  /* margin: 0 auto; */
  /* padding: auto; */
  background-color: #545c64;

}

#body {
  background-color: #ebeff0;
  padding-bottom: 20px;
}

#footer {
  bottom: 0;
  width:  100%;
  background-color: white;
}

.bodyContainer{
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ebeff0;
}
.bg-white{
  background-color: white;
}

</style>
