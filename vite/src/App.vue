
<template>
  <div>{{ title }}</div>
</template>

<script>
import { ref } from "vue";
export default {
  setup() {
    const title = ref("Hello Vite");
    return {
      title,
    };
  },
};
</script>

<style scoped>
</style>
