<template>
  <div data-e2e="more-options-menu">
    <div class="moreoptionsmenu" :class="isCustomerListOpen" @click.stop="toggleCustomerList()">
      <span class="moreoptionsmenu__icon">&#xF1D9;</span>
    </div>
    <div v-if="showClient" class="moreoptionsmenu__selected-customer" @click.stop="restoreCustomer()">
      <span class="moreoptionsmenu__selected-customer__name">{{ $store.state.customerData.selectedCustomerName }}</span>
      <span class="moreoptionsmenu__selected-customer__icon">&#xF159;</span>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'MoreOptionsMenu',
    props: ['statusCList'],
    data: () => {
      return {
        showClient : false,
      }
    },
    watch: {
      '$route' (to, from) {
         this.hasSelectedCustomer()
      }
    },
    computed: {
      isCustomerListOpen() {
        return { 'moreoptionsmenu__customerlist--open' : this.statusCList }
      },
    },
    methods: {
      hasSelectedCustomer() {
        let _path = this.$router.currentRoute.value.path.substring(1, this.$router.currentRoute.value.path.length-1).split('/')[0];
        this.showClient = (this.$store.state.customerData.selectedCustomerName != this.$store.state.customerData.customerName && 
                      (_path == 'management' || 
                        _path == 'availability' || 
                        _path == 'reports'));
        
      },
      toggleCustomerList() {
        this.$emit('toggleCList');
      },
      restoreCustomer() {
        let _cData = {
          customerId             : this.$store.state.customerData.customerId,
          customerName           : this.$store.state.customerData.customerName,
          selectedCustomerId     : this.$store.state.customerData.customerId,
          selectedCustomerName   : this.$store.state.customerData.customerName,
          selectedCasaCustomerId : false,
        }
        this.$store.commit('SET_CUSTOMER_INFO', _cData);
      },
    },
    mounted() {
      this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.hasSelectedCustomer()
      });
    }
  }
</script>
<style lang="scss" scoped>
  @use "@/scss/includes/moreoptionsmenu";
</style>
