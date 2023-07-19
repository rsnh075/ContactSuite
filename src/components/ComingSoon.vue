<template>
  <div style="text-align:center" data-e2e="coming-soon-ish"><br><br>COMING SOON</div>
</template>

<script>

  export default {
    name: 'ComingSoon',
    inject: ['showLoader'],
    updated() {
      this.showLoader(false);
    },
    mounted() {
      this.showLoader(false);
      console.log('Coming Soon');
    }
  }

</script>

<style lang="scss" scoped>
  


</style>