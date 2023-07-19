<template>
  <div class="tabs-wrapper tabs-wrapper--popup" data-e2e="call-groups-tab-bar">
    <a v-for="(tablbl, index) in tabdata"
      :key="index"
      @click="showTabContent(index)"
      :class="['tabs__tab', { 'tabs__tab--active-availability' : isactive == index },
      { 'tabs__tab--notvalid' : notvalidtabs.indexOf(index) > -1 },
      { 'tabs__tab--invisible' : (rgtypeisnumbers && index == 2) }]">
      {{ tablbl }}
    </a>
  </div>  
</template>

<script>
  export default {
    name: 'TabBar',
    props: ['tabdata', 'isactive', 'notvalidtabs', 'rgtypeisnumbers'],
    data: () => {
      return {
        
      }
    },
    methods: {
      showTabContent(index) {
        this.$emit('switchtab', {'index' : index});
      },
    },
    mounted() {
      
    }
  }

</script>
