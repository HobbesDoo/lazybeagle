<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles for the home network dashboard */
* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100dvh; /* iOS Safari friendly */
  min-height: -webkit-fill-available;
}

body {
  margin: 0;
  padding: 0;
  background-color: transparent;
}

#app {
  width: 100vw;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
