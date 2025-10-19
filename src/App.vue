<template>
  <div id="app">
    <navMenu></navMenu>
    <div id="body" class="w1200">
      <dataPage></dataPage>
    </div>

  </div>
</template>

<script>
import navMenu from './components/NavMenu.vue'
import dataPage from './components/DataPage.vue'

export default {
  name: 'App',
  components: {
    navMenu,
    dataPage
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
  padding: 0;
}

#body {
  padding: 0;
  padding-top: 80px;
}

.w1200 {
  width: 1200px;
  margin: auto;
}
</style>
