<template>
  <div>
    <div class="typo-center-center">{{ $store.state.settings.reconnecttxt }}</div>
  </div>
</template>

<script>

  export default {
    name: 'ReConnectScreen',
    watch: {
      '$route' (to, from) {
        //preload.hide();
      }
    },
    mounted() {
      //preload.hide();
    }
  }
</script>